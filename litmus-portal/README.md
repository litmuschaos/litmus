## **Litmus Portal**

Litmus-Portal provides console and UI experience for managing, monitoring, and events around chaos workflows. Chaos workflows consist of a sequence of experiments run together to achieve the objective of introducing some kind of fault into an application or the Kubernetes platform.

## **Platforms Support**

-   Minikube
-   GKE
-   KIND
-   EKS
-   Okteto Cloud

## **Pre-requisites**

-   Kubernetes 1.11 or later.

## **Installation**

#### Applying k8s manifest
> Beta 0 (Stable)
```bash
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/v1.11.x/litmus-portal/cluster-k8s-manifest.yml
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
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/litmus-portal-crds.yml
curl https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/namespaced-K8s-template.yml --output litmus-portal-namespaced-K8s-template.yml
envsubst < litmus-portal-namespaced-K8s-template.yml > ${LITMUS_PORTAL_NAMESPACE}-ns-scoped-litmus-portal-manifest.yml
kubectl apply -f ${LITMUS_PORTAL_NAMESPACE}-ns-scoped-litmus-portal-manifest.yml -n ${LITMUS_PORTAL_NAMESPACE}
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/platforms/okteto/hello-world-AUT.yml -n ${LITMUS_PORTAL_NAMESPACE}
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

```bash
export NODE_NAME=$(kubectl get pod -n litmus -l "component=litmusportal-frontend" -o=jsonpath='{.items[*].spec.nodeName}')
export EXTERNAL_IP=$(kubectl get nodes $NODE_NAME -o jsonpath='{.status.addresses[?(@.type=="ExternalIP")].address}')
export NODE_PORT=$(kubectl get -o jsonpath="{.spec.ports[0].nodePort}" services litmusportal-frontend-service -n litmus)
echo "URL: http://$EXTERNAL_IP:$NODE_PORT"
```

Note: Default `username: admin` and `password: litmus`

### **User Guide for Litmus Portal**

Litmus-Portal provides console or UI experience for managing, monitoring, and events round chaos workflows. Chaos workflows consist of a sequence of experiments run together to achieve the objective of introducing some kind of fault into an application or the Kubernetes platform.

View the User Guide <b>[here](https://docs.google.com/document/d/1fiN25BrZpvqg0UkBCuqQBE7Mx8BwDGC8ss2j2oXkZNA/edit#)</b>

### **Uninstallation**

> Beta 0 (Stable)
```bash
kubectl delete -f https://raw.githubusercontent.com/litmuschaos/litmus/v1.11.x/litmus-portal/cluster-k8s-manifest.yml
```

Or

> Master (Latest) Cluster scope. Uninstall in litmus namespace by default.
```bash
kubectl delete -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/cluster-k8s-manifest.yml
```

Or

> Master (Latest) Namespaced scope. Replace `<namespace>` with the desired namespace.
```bash
export LITMUS_PORTAL_NAMESPACE="<namespace>"
kubectl delete -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/litmus-portal-crds.yml
kubectl delete -f ${LITMUS_PORTAL_NAMESPACE}-ns-scoped-litmus-portal-manifest.yml -n ${LITMUS_PORTAL_NAMESPACE}
kubectl delete -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/platforms/okteto/hello-world-AUT.yml -n ${LITMUS_PORTAL_NAMESPACE}
```

### **Tech Stack**

-   Frontend
    -   TypeScript
    -   JavaScript
    -   ReactJS
    -   Apollo GraphQL client
    -   MaterialUI
-   Backend
    -   GoLang
    -   GQLGEN GraphQL Server
-   Database
    -   MongoDB

##### **Additional information**

-   <a href="https://github.com/litmuschaos/litmus/wiki/portal-design-spec" target="_blank">Litmus Portal Design Specification</a><br>
-   <a href="https://github.com/litmuschaos/litmus/wiki/Litmus-Portal-Development-Guide" target="_blank">Litmus Portal Development Guide</a>
