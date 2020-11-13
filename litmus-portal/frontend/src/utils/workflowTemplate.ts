export const workflowOnce =
  '{\r\n   "apiVersion": "argoproj.io/v1alpha1",\r\n   "kind": "Workflow",\r\n   "metadata": {\r\n      "generateName": "argowf-chaos-node-cpu-hog-",\r\n      "namespace": "litmus"\r\n   },\r\n   "spec": null\r\n}';
export const cronWorkflow =
  '{\r\n   "apiVersion": "argoproj.io/v1alpha1",\r\n   "kind": "CronWorkflow",\r\n   "metadata": {\r\n      "name": "argo-chaos-pod-memory-cron-wf",\r\n      "namespace": "litmus"\r\n   },\r\n   "spec": {\r\n      "schedule": "0 * * * *",\r\n      "concurrencyPolicy": "Forbid",\r\n      "startingDeadlineSeconds": 0,\r\n      "workflowSpec": null\r\n   }\r\n}';
