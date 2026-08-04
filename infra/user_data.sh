#!/bin/bash
set -euo pipefail
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
exec > >(tee -a /var/log/user_data.log /dev/console) 2>&1
echo "=== PromptDoc bootstrap starting ==="
# ── System updates + Docker ───────────────────────────────────────────────────
dnf update -y
dnf install -y docker git awscli

systemctl enable docker
systemctl start docker
usermod -a -G docker ec2-user

# Docker Compose v2 plugin
COMPOSE_VERSION="v2.24.1"
COMPOSE_URL="https://github.com/docker/compose/releases/download/$${COMPOSE_VERSION}/docker-compose-linux-x86_64"
COMPOSE_SHA256="d350bbbd1c74c0a8542193bd41881afea534b141c6a9d9a27b2f217e51d5c48c"
COMPOSE_BIN="/usr/local/lib/docker/cli-plugins/docker-compose"

mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL "$COMPOSE_URL" -o "$COMPOSE_BIN"
printf '%s  %s\n' "$COMPOSE_SHA256" "$COMPOSE_BIN" | sha256sum -c -
chmod +x "$COMPOSE_BIN"

# ── Clone repo ────────────────────────────────────────────────────────────────
PROMPTDOC_REPO_REF="1157b9b283977855368d0a9a5631b3e48b839ba4"
git clone "${github_repo}" /home/ec2-user/promptDoc
cd /home/ec2-user/promptDoc
git checkout "$PROMPTDOC_REPO_REF"

get_ssm_value() {
  local param_name="$1"
  aws ssm get-parameter --region "${aws_region}" --name "${ssm_prefix}$${param_name}" --with-decryption --query 'Parameter.Value' --output text
}

# get_ssm_value_optional never fails the script if the parameter doesn't exist
# (used for params whose SSM entry is only created conditionally in Terraform).
get_ssm_value_optional() {
  local param_name="$1"
  aws ssm get-parameter --region "${aws_region}" --name "${ssm_prefix}$${param_name}" --with-decryption --query 'Parameter.Value' --output text 2>/dev/null || echo ""
}

INTERNAL_API_SECRET="$(get_ssm_value "/internal-api-secret")"
VOYAGE_API_KEY="$(get_ssm_value "/voyage-api-key")"
PINECONE_API_KEY="$(get_ssm_value "/pinecone-api-key")"
GEMINI_API_KEY="$(get_ssm_value "/gemini-api-key")"
# Optional: the /langchain-api-key SSM parameter only exists if
# var.langchain_api_key was set in Terraform, so this must not use set -e's
# hard-fail behavior — fetch it once, here, with a safe fallback.
LANGCHAIN_API_KEY="$(get_ssm_value_optional "/langchain-api-key")"

# ── Write env files from runtime secrets fetched from Parameter Store ────────
# chunk-service
cat > services/chunk-service/.env <<ENVEOF
REDIS_URL=redis://redis:6379
INTERNAL_API_SECRET=$INTERNAL_API_SECRET
MAX_CHUNK_SIZE=1500
MIN_CHUNK_SIZE=50
MAX_FILE_SIZE_KB=500
ENVEOF

# embed-service
cat > services/embed-service/.env <<ENVEOF
REDIS_URL=redis://redis:6379
INTERNAL_API_SECRET=$INTERNAL_API_SECRET
VOYAGE_API_KEY=$VOYAGE_API_KEY
PINECONE_API_KEY=$PINECONE_API_KEY
PINECONE_INDEX_NAME=${pinecone_index_name}
PINECONE_HOST=${pinecone_host}
BATCH_SIZE=128
WORKER_SLEEP_SECONDS=1
ENVEOF

# rag-service
cat > services/rag-service/.env <<ENVEOF
REDIS_URL=redis://redis:6379
INTERNAL_API_SECRET=$INTERNAL_API_SECRET
GEMINI_API_KEY=$GEMINI_API_KEY
VOYAGE_API_KEY=$VOYAGE_API_KEY
PINECONE_API_KEY=$PINECONE_API_KEY
PINECONE_INDEX_NAME=${pinecone_index_name}
PINECONE_HOST=${pinecone_host}
MAX_RETRIEVAL_RESULTS=8
MAX_CONTEXT_CHUNKS=12
MAX_CRITIQUE_LOOPS=1
TEMPERATURE=0.2
BATCH_SIZE=32
LANGCHAIN_API_KEY=$LANGCHAIN_API_KEY
LANGCHAIN_TRACING_V2=$([ -n "$LANGCHAIN_API_KEY" ] && echo true || echo false)
LANGCHAIN_PROJECT=${langchain_project}
ENVEOF

# ── Fix ownership ─────────────────────────────────────────────────────────────
chown -R ec2-user:ec2-user /home/ec2-user/promptDoc

# ── Caddy (static binary — Copr has no AL2023 target) ────────────────────────
CADDY_VERSION="2.11.4"
CADDY_TARBALL="caddy_$${CADDY_VERSION}_linux_amd64.tar.gz"
CADDY_URL="https://github.com/caddyserver/caddy/releases/download/v$${CADDY_VERSION}/$${CADDY_TARBALL}"
CADDY_CHECKSUMS_URL="https://github.com/caddyserver/caddy/releases/download/v$${CADDY_VERSION}/caddy_$${CADDY_VERSION}_checksums.txt"
mkdir -p /tmp/caddy-install
cd /tmp/caddy-install
curl -fsSL "$CADDY_URL" -o "$CADDY_TARBALL"
curl -fsSL "$CADDY_CHECKSUMS_URL" -o checksums.txt
# NOTE: Caddy's official release checksums.txt uses SHA-512, not SHA-256 —
# using sha256sum here fails with "no properly formatted SHA256 checksum
# lines found" and (with set -e) aborts the entire bootstrap script.
sha512sum --ignore-missing -c checksums.txt
tar -xzf "$CADDY_TARBALL" caddy

install -o root -g root -m 0755 caddy /usr/bin/caddy
setcap 'cap_net_bind_service=+ep' /usr/bin/caddy

groupadd --system caddy
useradd --system --gid caddy --create-home --home-dir /var/lib/caddy --shell /usr/sbin/nologin caddy

mkdir -p /etc/caddy
chown -R caddy:caddy /etc/caddy

cat > /etc/systemd/system/caddy.service <<'SERVICEEOF'
[Unit]
Description=Caddy
Documentation=https://caddyserver.com/docs/
After=network.target network-online.target
Requires=network-online.target

[Service]
Type=notify
User=caddy
Group=caddy
ExecStart=/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile --force
TimeoutStopSec=5s
LimitNOFILE=1048576
LimitNPROC=512
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload

SERVICE_DOMAIN="$(echo "${eip_public_ip}" | tr '.' '-').nip.io"

cat > /etc/caddy/Caddyfile <<CADDYEOF
$SERVICE_DOMAIN {
    handle_path /chunk/* {
        reverse_proxy 127.0.0.1:8001
    }
    handle_path /embed/* {
        reverse_proxy 127.0.0.1:8002
    }
    handle_path /rag/* {
        reverse_proxy 127.0.0.1:8003
    }
}
CADDYEOF

chown caddy:caddy /etc/caddy/Caddyfile

# ── Build and start all services ──────────────────────────────────────────────
cd /home/ec2-user/promptDoc
echo "=== Pulling docker images ==="
docker compose pull

echo "=== Starting docker compose stack ==="
docker compose up -d

# Give the backend containers a moment to bind their ports before Caddy
# starts proxying to them (avoids a burst of 502s / connection-refused
# right after boot while containers are still initializing).
echo "=== Waiting for backend services to come up ==="
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:8001/health" 2>/dev/null \
     && curl -fsS -o /dev/null "http://127.0.0.1:8002/health" 2>/dev/null \
     && curl -fsS -o /dev/null "http://127.0.0.1:8003/health" 2>/dev/null; then
    echo "All backend services are healthy."
    break
  fi
  echo "Backend services not ready yet (attempt $i/30), waiting..."
  sleep 5
done

# ── Start Caddy only once the backends are up, so the very first ACME/HTTP
# request it proxies doesn't hit connection-refused ────────────────────────
systemctl enable caddy
systemctl restart caddy

echo "=== PromptDoc bootstrap complete ==="