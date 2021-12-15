## **Litmus Portal**

Litmus-Portal provides console and UI experience for managing, monitoring, and events around chaos workflows. Chaos workflows consist of a sequence of experiments run together to achieve the objective of introducing some kind of fault into an application or the Kubernetes platform.

## **Platforms Support**

- Minikube
- GKE
- KIND
- EKS
- Okteto Cloud
- AKS
- K3S
- Civo Cloud
- Kublr

## **Pre-requisites**

- Kubernetes 1.17 or later.

## **Installation**

#### Applying k8s manifest

> Litmus-2.4.0 (Stable) Cluster Scope manifest

```bash
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/2.4.0/mkdocs/docs/2.4.0/litmus-2.4.0.yaml
```

Or

> Master (Latest) Cluster scope. Install in litmus namespace by default.

```bash
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/cluster-k8s-manifest.yml
```

Or

> Master (Latest) Namespaced scope. Replace `<namespace>` with the desired namespace.

```bash
export LITMUS_PORTAL_NAMESPACE="<namespace>"
kubectl create ns ${LITMUS_PORTAL_NAMESPACE}
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/2.4.0/litmus-portal/litmus-portal-crds.yml
curl https://raw.githubusercontent.com/litmuschaos/litmus/2.4.0/mkdocs/docs/2.4.0/litmus-namespaced-2.4.0.yaml --output litmus-portal-namespaced-k8s-template.yml
envsubst '${LITMUS_PORTAL_NAMESPACE}' < litmus-portal-namespaced-k8s-template.yml > ${LITMUS_PORTAL_NAMESPACE}-ns-scoped-litmus-portal-manifest.yml
kubectl apply -f ${LITMUS_PORTAL_NAMESPACE}-ns-scoped-litmus-portal-manifest.yml -n ${LITMUS_PORTAL_NAMESPACE}
```

#### Configuration Options for Cluster scope.

- `litmus-portal-operations-config` configmap.

  > `AgentNamespace: litmus`

- All environment variables.

#### Configuration Options for Namespace scope.

- `litmus-portal-operations-config` configmap.

  > `AgentNamespace: ${LITMUS_PORTAL_NAMESPACE}`

- All environment variables.

#### Retrieving external url to access the litmus portal

##### GKE/Okteto Cloud/EKS

```bash
export NODE_NAME=$(kubectl -n $LITMUS_PORTAL_NAMESPACE get pod  -l "component=litmusportal-frontend" -o=jsonpath='{.items[*].spec.nodeName}')
export EXTERNAL_IP=$(kubectl -n $LITMUS_PORTAL_NAMESPACE get nodes $NODE_NAME -o jsonpath='{.status.addresses[?(@.type=="ExternalIP")].address}')
export NODE_PORT=$(kubectl -n $LITMUS_PORTAL_NAMESPACE get -o jsonpath="{.spec.ports[0].nodePort}" services litmusportal-frontend-service)
echo "URL: http://$EXTERNAL_IP:$NODE_PORT"
```

#### Minikube

```bash
minikube -n $LITMUS_PORTAL_NAMESPACE --url litmusportal-frontend-service
```

Note: Default `username: admin` and `password: litmus`

### **User Guide for Litmus Portal**

Litmus-Portal provides console or UI experience for managing, monitoring, and events round chaos workflows. Chaos workflows consist of a sequence of experiments run together to achieve the objective of introducing some kind of fault into an application or the Kubernetes platform.

View the User Guide <b>[here](https://docs.litmuschaos.io/)</b>

### **Uninstallation**

You can uninstall using the steps from [section here](http://docs.litmuschaos.io//docs/user-guides/uninstall-litmus)

- <a href="https://github.com/litmuschaos/litmus/wiki/portal-design-spec" target="_blank">Litmus Portal Design Specification</a><br>
- <a href="https://github.com/litmuschaos/litmus/wiki/Litmus-Portal-Development-Guide" target="_blank">Litmus Portal Development Guide</a>
