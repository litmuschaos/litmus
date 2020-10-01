Litmus Portal
Litmus-Portal provides console and UI experience for managing, monitoring, and events around chaos workflows. Chaos workflows consist of a sequence of experiments run together to achieve the objective of introducing some kind of fault into an application or the Kubernetes platform.
Platforms Support
Minikube
GKE
KIND
Pre-requisites
Kubernetes 1.11 or later.
Installation
Applying k8s manifest
Alpha0 (Stable)
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/v1.8.x/litmus-portal/k8s-manifest.yml
Or
Master (Latest)
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/k8s-manifest.yml
Retrieving external url to access the litmus portal
export NODE_NAME=$(kubectl get pod -n litmus -l "component=litmus portal-frontend" -o=jsonpath='{.items[*].spec.nodeName}')
export EXTERNAL_IP=$(kubectl get nodes $NODE_NAME -o jsonpath='{.status.addresses[?(@.type=="ExternalIP")].address}')
export NODE_PORT=$(kubectl get -o jsonpath="{.spec.ports[0].nodePort}" services litmus portal-frontend-service -n litmus)
echo "URL: http://$EXTERNAL_IP:$NODE_PORT"
Note: Default username: admin and password: litmus
User Guide for Litmus Portal
Litmus-Portal provides console or UI experience for managing, monitoring, and events round chaos workflows. Chaos workflows consist of a sequence of experiments run together to achieve the objective of introducing some kind of fault into an application or the Kubernetes platform.
View the User Guide here
Uninstallation
kubectl delete -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/k8s-manifest.yml
Tech Stack
Frontend
TypeScript
JavaScript
ReactJS
Apollo GraphQL client
MaterialUI
Backend
GoLang
GQLGEN GraphQL Server
Database
MongoDB
Prometheus
Additional information
Litmus Portal Design Specification
Litmus Portal Development Guide

