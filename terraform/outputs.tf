output "cluster_name" {
  value = google_container_cluster.primary.name
}

output "get_credentials" {
  value = "gcloud container clusters get-credentials ${google_container_cluster.primary.name} --zone ${var.region}-a --project ${var.project_id}"
}