#!bin/bash
oc adm policy add-cluster-role-to-user cluster-admin admin --as=system:admin
oc adm policy add-scc-to-user anyuid -z default --as=system:admin
oc adm policy add-scc-to-user hostaccess admin -- as:system:admin
kubectl patch scc/restricted -p '{"allowHostDirVolumePlugin":true}'
kubectl patch scc/restricted -p '{"allowHostNetwork":true}'
kubectl patch scc/restricted -p '{"allowPrivilegedContainer":true}'
kubectl patch scc/restricted -p '{"allowedCapabilities":["IPC_LOCK", "SYS_RESOURCE"]}'
kubectl patch scc/restricted -p '{"runAsUser":{"type": "RunAsAny"}}'