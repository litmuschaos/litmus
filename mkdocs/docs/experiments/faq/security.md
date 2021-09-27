---
hide:
  - toc
---
# Security

## Table of Contents

1. [How does litmus enable execution for security practices?](#how-does-litmus-enable-execution-for-security-practices)

### How does litmus enable execution for security practices?

Litmus supports different modes of operations - the most used ones are the standard/regular modes & admin mode. Latter is used when users have autonomy over the cluster and generally have cluster-wide permissions (say, either dev test purposes on small/transient clusters or SREs with singular access to protected environments). Here there is an all-encompassing svcAccount that can run all experiments (which is shipped with admin mode installation via helm OR can be installed via kubectl using a public manifest) w/o the need to create a chaosServiceAccount or select one for each experiment. So, if you opt for this mode, you need not bother about creating a svcAccount before you run each exp :)

In the case of the regular/standard mode (also what is explained as default in the get-started/experiment documentation - for illustrative purposes), the litmus infra or control plane is expected to be setup by an admin persona - a post which developers can run chaos experiments in their respective namespaces by using (creating/selecting) a ChaosServiceAccount that has just enough permissions necessary for their exp. Each experiment in the chaoshub/docs is accompanied by such a reference/example RBAC. This model holds for some staging clusters managed by a cluster-admin persona, but being liberally accessed and used by different developers or service-owners w/ their own chaos needs.

Now, in this std mode, the emphasis is on what kind of permissions the developer/user is entrusted with within your self-service environment. If the persona has visibility to other serviceaccounts that [do not belong to] / [have not been created by] him/her, OR has permissions to impact beyond one/more namespaces - then that is a conscious choice. They will be able to use these other SA. The constraint being, the SA has enough permissions to run the chosen experiment, the lack of which can cause failure.

On how to ensure security, part - it is expected that these environments are set up in such a way as to allow restricted visibility and actions for the individual users. What litmus provides is an option to still enable them to run experiments in such environments by clearly defining what min. permissions are needed to run a given experiment - so they can end up with a catalog that works for them. We have seen various use-cases around this model in the litmuschaos community.

In truly multi-tenant environments that have very strict boundaries & role enforcements, litmus also allows a wholly namespaced mode of execution - where not only the experiment resources but the entire control plane can be created inside a particular namespace (for ex: Okteto Cloud) to ease management and visibility. Here too a single serviceaccount is sufficient to run most pod-level chaos experiments, there being a natural/inherent deterrent for running experiments with cluster-wide/multi-service blast radius.
