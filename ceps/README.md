# Chaos Enhancement Proposals (CEPs)

A Chaos Enhancement Proposal (CEP) is a way to propose, communicate and coordinate on new efforts for the LitmusChaos project.
You can read the full details of the project in [CEP-1](0001-chaos-enhancement-proposal-process.md).

This process is still in _alpha_ state and is mandatory for all major feature beginning release 0.9.

## Quick start for the CEP process

-   Socialize an idea with the Litmus contributors.Make sure that others think the work is worth taking up and will help review the CEP and any code changes required.
-   Follow the process outlined in the [CEP template](YYYYMMDD-cep-template.md)

## FAQs

### Do I have to use the CEP process

No... but we hope that you will.
Over time having a rich set of CEPs in one place will make it easier for people to track what is going in the community 
and find a structured historic record.

CEPs are required when the changes are wide-ranging & are feature-level items. 
These changes are usually coordinated through Litmus maintainers.

### Why would I want to use the CEP process

Our aim with CEPs is to clearly communicate new efforts to the Litmus Chaos contributor community.
As such, we want to build a well curated set of clear proposals in a common format with useful metadata.

We are inspired by KEPs, i.e., [Kubernetes Enhancement Proposals](https://github.com/kubernetes/enhancements/tree/master/keps)

### Do I put my CEP in the root CEP directory or a SIG subdirectory

If the CEP is mainly restricted to one SIG's purview then it should be in a CEP directory for that SIG.
If the CEP is widely impacting much of Litmus, it should be put at the root of this directory.

### What will it take for CEPs to "graduate" out of "beta"

Things we'd like to see happen to consider CEPs well on their way.

-   A set of CEPs that show healthy process around describing an effort and recording decisions in a reasonable amount of time.
-   CEPs exposed on a searchable and indexable web site.
-   Presubmit checks for CEPs around metadata format and markdown validity.

Even so, the process can evolve. As we find new techniques we can improve our processes.

### My FAQ isn't answered here

The CEP process is still evolving!
If something is missing or not answered here feel free to reach out to [LitmusChaos Community](https://kubernetes.slack.com/messages/CNXNB0ZTN).
If you want to propose a change to the CEP process you can open a PR on [CEP-1](0001-cep-template.md) with your proposal.
