# Check the current pods 
* `kubectl get pods -w `
# Chaos Experiment 
* `kubectl apply -f ChaosExperiment/experiments-k8.yaml`
# Validate experiment 
* `kubectl get chaosexperiments`
# Chaos RBAC
* `kubectl apply -f ChaosExecution/rbac-chaos-admin.yaml`
# Chaos Execution 
* `kubectl apply -f ChaosExecution/engine-nginx-count-admin.yaml`
# Argo chaos submit on kube-system
* `argo submit Argo/argowf-chaos-admin.yaml -pappLabel=kiam -pappNamespace=kube-system -pfileName=pod-app-kill-health.json --watch`
# Argo Perf submit 
* `argo submit Argo/argowf-perf-chaos-admin.yaml -plimit=2 --watch`