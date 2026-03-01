# Deployment Architecture

This document describes the current deployment model for the application stack on Google Kubernetes Engine (GKE) via ArgoCD.

## Current Model: Standard Kubernetes Deployments

The application currently utilizes standard Kubernetes `Deployment` and `StatefulSet` objects for managing the application lifecycle.

### Components

1.  **Frontend (Nginx + React/Vite)**
    *   **Type**: Kubernetes `Deployment`
    *   **Scale**: 2 Replicas
    *   **Security**: Runs with a `readOnlyRootFilesystem` and a non-privileged container. Temporary directories (`/tmp`, `/var/cache/nginx`, `/var/run`) map to in-memory `emptyDir` volumes.
    *   **Routing**: Served via Nginx, proxying API requests to the Backend Service.

2.  **Backend (Node.js)**
    *   **Type**: Kubernetes `Deployment`
    *   **Scale**: 2 Replicas
    *   **Security**: Runs with a `readOnlyRootFilesystem` and a non-privileged container. Temporary `/tmp` directory maps to an `emptyDir`.
    *   **State:** Stateless, connecting to the PostgreSQL database for data persistence.

3.  **Database (PostgreSQL 16)**
    *   **Type**: Kubernetes `StatefulSet`
    *   **Scale**: 1 Replica
    *   **Storage**: 10Gi PersistentVolumeClaim for `/var/lib/postgresql/data`.
    *   **Security**: Runs with a `readOnlyRootFilesystem` and non-privileged constraints, using `emptyDir` mounts for runtime sockets.

### CI/CD Workflow (GitHub Actions & GitOps)

The deployment leverages a push-to-registry, pull-from-git approach (GitOps).

1.  **Code Push**: Developer pushes to the `main` branch.
2.  **CI Pipeline**: GitHub Actions runs linting, unit tests, and Trivy security scans.
3.  **Build & Push**: Docker images are built and pushed to the private Harbor registry (`registry.reachinbox.xyz`).
4.  **Manifest Update**: The pipeline updates the image tags in `gitops/apps/frontend/deployment.yml` and `gitops/apps/backend/deployment.yml` with the short Git SHA.
5.  **Git Commit**: The pipeline commits the updated manifest files back to the `main` branch.
6.  **ArgoCD Sync**: ArgoCD (running in the cluster) detects the changes in the Git repository and automatically synchronizes the cluster state to match the new image tags.

### Recent Changes & Rollbacks

The cluster temporarily experimented with **Argo Rollouts** for metrics-based canary deployments. However, it was intentionally **rolled back** to the standard `Deployment` model for simplicity. All `Rollout` CRDs, `AnalysisTemplate` resources, and the Argo Rollouts controller have been removed.
