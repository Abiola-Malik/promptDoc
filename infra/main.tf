terraform {
  backend "s3" {
    bucket         = "promptdoc-terraform-state"
    key            = "infra/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "promptdoc-terraform-locks"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "aws" {
  region = var.aws_region
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# The default AWS-managed key used to encrypt SecureString SSM paramehttps://100-48-248-128.nip.io/chunkters.
# Needed so the instance role can be granted kms:Decrypt against it.
data "aws_kms_alias" "ssm" {
  name = "alias/aws/ssm"
}

locals {
  service_domain = "${replace(aws_eip.promptdoc.public_ip, ".", "-")}.nip.io"
  # Pin to a single, deterministic subnet in the default VPC instead of
  # letting AWS pick one implicitly.
  subnet_id = data.aws_subnets.default.ids[0]
}

# ── Latest Amazon Linux 2023 AMI ─────────────────────────────────────────────
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ── Security group ────────────────────────────────────────────────────────────
resource "aws_security_group" "promptdoc" {
  name        = "promptdoc-sg"
  description = "PromptDoc SSH + Caddy (HTTP/HTTPS)"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.admin_ssh_cidr_blocks
    description = "SSH"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP for Lets Encrypt ACME challenge"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "promptdoc-sg"
    Project = "promptdoc"
  }
}

resource "aws_ssm_parameter" "internal_api_secret" {
  name        = "/promptdoc/internal-api-secret"
  type        = "SecureString"
  value       = var.internal_api_secret
  description = "Internal API secret for PromptDoc services"
}

resource "aws_ssm_parameter" "voyage_api_key" {
  name        = "/promptdoc/voyage-api-key"
  type        = "SecureString"
  value       = var.voyage_api_key
  description = "Voyage API key for PromptDoc embed service"
}

resource "aws_ssm_parameter" "pinecone_api_key" {
  name        = "/promptdoc/pinecone-api-key"
  type        = "SecureString"
  value       = var.pinecone_api_key
  description = "Pinecone API key for PromptDoc embed and rag services"
}

resource "aws_ssm_parameter" "gemini_api_key" {
  name        = "/promptdoc/gemini-api-key"
  type        = "SecureString"
  value       = var.gemini_api_key
  description = "Gemini API key for PromptDoc rag service"
}

resource "aws_ssm_parameter" "langchain_api_key" {
  count       = var.langchain_api_key == "" ? 0 : 1
  name        = "/promptdoc/langchain-api-key"
  type        = "SecureString"
  value       = var.langchain_api_key
  description = "LangChain API key for PromptDoc rag service"
}

resource "aws_iam_role" "promptdoc_instance" {
  name = "promptdoc-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Name    = "promptdoc-instance-role"
    Project = "promptdoc"
  }
}

resource "aws_iam_role_policy" "promptdoc_ssm_read" {
  name = "promptdoc-ssm-read"
  role = aws_iam_role.promptdoc_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadPromptDocParameters"
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = concat(
          [
            aws_ssm_parameter.internal_api_secret.arn,
            aws_ssm_parameter.voyage_api_key.arn,
            aws_ssm_parameter.pinecone_api_key.arn,
            aws_ssm_parameter.gemini_api_key.arn,
          ],
          aws_ssm_parameter.langchain_api_key[*].arn
        )
      },
      {
        # Required to decrypt SecureString parameters fetched with
        # --with-decryption. Without this, every `aws ssm get-parameter`
        # call in user_data.sh fails with AccessDenied and the bootstrap
        # script aborts (set -e) before any service starts.
        Sid      = "DecryptSsmSecureStrings"
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = data.aws_kms_alias.ssm.target_key_arn
      }
    ]
  })
}

resource "aws_iam_instance_profile" "promptdoc" {
  name = "promptdoc-instance-profile"
  role = aws_iam_role.promptdoc_instance.name
}

# ── EC2 instance ──────────────────────────────────────────────────────────────
resource "aws_instance" "promptdoc" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = local.subnet_id
  vpc_security_group_ids = [aws_security_group.promptdoc.id]
  iam_instance_profile   = aws_iam_instance_profile.promptdoc.name

  # passes env vars securely into the bootstrap script via templatefile()
  user_data_replace_on_change = true

  user_data = templatefile("${path.module}/user_data.sh", {
    github_repo          = var.github_repo
    aws_region            = var.aws_region
    ssm_prefix            = "/promptdoc"
    pinecone_host         = var.pinecone_host
    pinecone_index_name   = var.pinecone_index_name
    langchain_project     = var.langchain_project
    eip_public_ip         = aws_eip.promptdoc.public_ip
  })

  root_block_device {
    volume_size = 30 #for docker volumes
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name    = "promptdoc-server"
    Project = "promptdoc"
  }
}

resource "aws_eip" "promptdoc" {
  domain = "vpc"

  tags = {
    Name    = "promptdoc-eip"
    Project = "promptdoc"
  }
}

resource "aws_eip_association" "promptdoc" {
  instance_id   = aws_instance.promptdoc.id
  allocation_id = aws_eip.promptdoc.id
}