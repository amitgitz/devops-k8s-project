# DevOps GitOps Assignment - Comprehensive Setup

Welcome to the GitOps Operations Repository! This project provisions a scalable, secure Google Kubernetes Engine (GKE) environment, integrated with a fully functional CI/CD pipeline, GitOps deployment model (ArgoCD), and a robust, production-ready observability stack.

## 🚀 Architecture Overview

The system is designed with a strict **GitOps** philosophy: the `main` branch of this repository represents the absolute desired state of the entire Kubernetes cluster environment. No manual `kubectl apply` commands are required for production deployments.

### Core Stack
* **Infrastructure**: Google Kubernetes Engine (GKE) managed via **Terraform**.
* **Container Registry**: Private **Harbor** Registry (`registry.reachinbox.xyz`).
* **CI/CD Pipeline**: **GitHub Actions** (Lint, Test, Trivy Security Scan, Docker Build & Push).
* **GitOps Controller**: **ArgoCD** (Continuously monitoring this repo and synchronizing the cluster state).
* **Ingress & SSL**: Nginx Ingress Controller with Google Cloud Managed Certificates automatically provisioning SSL for all domains.

### Deployed Applications
The environment runs a distributed 3-tier application:
1. **Frontend (React + Vite)**: Served via Nginx on `app.mailscale.online`.
2. **Backend (Node.js)**: REST API listening on port 5000, internally routed via `/api/*` from the frontend ingress.
3. **Database (PostgreSQL 16)**: Running as a StatefulSet with a 10Gi Persistent Volume.

## 🔒 Security Enhancements
To adhere to the Principle of Least Privilege, all deployed applications (Frontend, Backend, and Database):
- Run in **Non-Privileged** containers (`privileged: false`).
- Enforce a **Read-Only Root Filesystem** (`readOnlyRootFilesystem: true`).
- Utilize ephemeral `emptyDir` mounts for necessary writable runtime directories (e.g., `/tmp`, `/var/run`, `/var/cache/nginx`).
- Images are automatically scanned for vulnerabilities using **Trivy** in the CI/CD pipeline before building.

## 📊 Observability & Monitoring Stack
A comprehensive monitoring stack is deployed in the `monitoring` namespace and exposed via secure ingresses.

* **Prometheus**: Scrapes metrics automatically via `ServiceMonitors`.
* **Grafana**: Exposed at `grafana.mailscale.online` (Login: `admin` / `devops-admin`). Pre-configured with datasources for Prometheus, Loki, and Jaeger.
* **Loki & Promtail**: Centralized log aggregation. Promtail agents collect stdout/stderr from all pods and ship them to Loki for querying in Grafana.
* **Jaeger**: Distributed tracing instrumentation.

## 🔄 Deployment Pipeline (GitHub Actions -> ArgoCD)
The deployment lifecycle is fully automated:
1. **Push**: A developer merges code to `main`.
2. **Build & Security**: GitHub Actions tests the code, runs Trivy security scans, builds Docker images, and pushes them to the Harbor registry, tagged with the Git commit SHA.
3. **Manifest Injection**: The GitHub Actions pipeline updates `gitops/apps/frontend/deployment.yml` and `gitops/apps/backend/deployment.yml` with the new image tags and pushes these changes directly back to the repo.
4. **GitOps Sync**: ArgoCD detects the manifest changes in Git within 3 minutes (or instantly via Webhook) and cleanly rolls out the new `Deployment` objects in the GKE cluster.

For a detailed breakdown of the application workload architecture, see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## 🗂️ Repository Structure

```text
├── .github/workflows/       # CI/CD Pipeline (deployment.yml)
├── apps/                    # Application source code
│   ├── backend/             # Node.js REST API
│   └── frontend/            # React/Vite web application
├── docs/                    # Architectural Documentation
├── gitops/                  # Kubernetes Manifests (The Source of Truth)
│   ├── apps/                # Frontend & Backend deployments & services
│   ├── argocd/              # ArgoCD App of Apps definitions
│   ├── database/            # PostgreSQL StatefulSet & configs
│   ├── monitoring/          # Grafana, Loki, Jaeger, Prometheus alerting
│   ├── namespaces/          # K8s Namespace definitions
│   └── networking/          # Nginx Ingress & Managed Certificates
└── terraform/               # GKE Infrastructure as Code
```

## 🛠️ Bootstrapping the Cluster
If deploying this cluster from scratch:
1. Navigate to the `terraform/` directory and run `terraform apply`.
2. Once the GKE cluster is online, install ArgoCD into the cluster:
   `kubectl create namespace argocd`
   `kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml`
3. Apply the "App of Apps" manifest to kick off the GitOps sync:
   `kubectl apply -f gitops/argocd/apps.yml`
4. ArgoCD will naturally take over and deploy the networking layer, the databases, the monitoring stack, and finally the applications.
