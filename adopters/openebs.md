## OpenEBS

OpenEBS is the most active Container Attached Storage project in Kubernetes world. OpenEBS enables the DevOps teams to have their dedicated storage policies for each workload and it is completely Kubernetes native. It provides different storage engines such as [Jiva](https://docs.openebs.io/docs/next/jiva.html), [cStor](https://docs.openebs.io/docs/next/cstor.html), [LocalPV](https://docs.openebs.io/docs/next/localpv.html) which could be chosen according to the user's storage requirements.

### **Why do we use litmus**

In OpenEBS E2E testing, We realised that functional testing alone is not sufficient to ensure the resiliency of the system. So, We planned to practice chaos engineering in our E2E test suite in order to validate the system's  resiliency. We wanted to induce chaos not only specific to OpenEBS components but also on the underlying Kubernetes components which forms the skeleton for Containers infrastructure. Litmus eases our vision by providing chaos charts for the above said components. Litmus has a separate chaos category for OpenEBS charts which is evolving continuously.

### How do we use litmus

In OpenEBS E2E, we use GitLab for CI operations. The [OpenEBS](https://hub.litmuschaos.io/charts/openebs) and [Kubernetes generic](https://hub.litmuschaos.io/charts/generic) chaos charts provided by litmuschaos are incorporated into E2E pipelines which are being executed through GitLab. The OpenEBS E2E tests are executed against various flavours of Kubernetes such as OpenShift, D2IQ Konvoy, Rancher and native plaform as well. So, we use litmus chaos chart in all those platforms to ensure the resiliency of OpenEBS system. The test results are represented via UI portal called [openebs.ci](https://openebs.ci/)

Apart from E2E pipelines, we use litmus chaos charts in our soak testing suite where the charts are executed at random intervals.

### Benefits in using litmus

After incorporating the chaos charts into our E2E test pipelines and soak testing environment, the hidden resiliency issues were detected. When we execute the charts at random intervals along with functional test scenarios, the corner cases are getting covered which brings out the resiliency issues.
