# Red Hat
[Red Hat](https://www.redhat.com) is an enterprise software company with an open source development model.  

## Why do we use Litmus.  
We wanted to test the maturity of the Red Hat Openshift Virtualization solution using chaos testing. Following that, we decided to use Litmus for these reasons:
- It's an Open Source project
- It has a wide selection of experiments available
- It's a CNCF sandbox project
- It has a vibrant community
- There are frequent releases and it is well maintained

## How do we use Litmus.  
Litmus experiments are deployed against a single Openshift cluster that runs on top of a baremetal server using libvirt/KVM. Each experiment consists of observing the behavior upon applying chaos to the underlying infrastucture of a running VMI pod instance, and validating the results of the probes. The chaos we inject to the VMs that host the openshift nodes can vary from triggering reboots, sudden shutdowns, suspend the node and network disruption at the node level, among others. 

## Benefits in using Litmus.   
Being a cloud native solution, Litmus allows us to define our experiment and expectations in the `chaosexperiment` manifest and retrieve the results in the `chaosresult` object generated at runtime. Its vast selection of experiments, periodic release cadence and a welcoming community were sufficient signals that ensured with Litmus we would achieve our goal.
