
output "service_domain" {
  value = local.service_domain
}

output "chunk_service_url" {
  value = "https://${local.service_domain}/chunk/"
}

output "embed_service_url" {
  value = "https://${local.service_domain}/embed/"
}

output "rag_service_url" {
  value = "https://${local.service_domain}/rag/"
}