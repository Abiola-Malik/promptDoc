variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "key_pair_name" {
  description = "Name of the EC2 key pair for SSH access"
  type        = string
}

variable "admin_ssh_cidr_blocks" {
  description = "CIDR blocks allowed to reach SSH on port 22"
  type        = list(string)
}

variable "github_repo" {
  description = "GitHub repo to clone onto the instance"
  type        = string
  default     = "https://github.com/Abiola-Malik/promptDoc.git"

  validation {
    condition = can(regex("^https://github\\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:\\.git)?$", var.github_repo)) && !can(regex("[\\\"'`$;&|<>\\n\\r]", var.github_repo))
    error_message = "github_repo must be a safe HTTPS GitHub repository URL such as https://github.com/owner/repo.git."
  }
}

variable "instance_type" {
  description = "EC2 instance type (t3.micro; free-tier eligibility varies by region/account)"
  type        = string
  default     = "t3.micro"
}


variable "internal_api_secret" {
  description = "Shared secret between Next.js BFF and Python services"
  type        = string
  sensitive   = true
}

variable "voyage_api_key" {
  type      = string
  sensitive = true
}

variable "pinecone_api_key" {
  type      = string
  sensitive = true
}

variable "pinecone_host" {
  type = string
}

variable "pinecone_index_name" {
  type    = string
  default = "promptdoc"
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}

variable "langchain_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "langchain_project" {
  type    = string
  default = "promptdoc-rag"
}