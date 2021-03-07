# Raspbernetes

[Raspbernetes](gttps://github.com/raspbernetes) is an open source project with multiple contributors for running Kubernetes 
clusters on Raspberry Pis. The project started with a goal to automate the setup and management of a Kubernetes cluster on Raspberry Pis. 
It aims to be completely declarative and idempotent.

## Why do we use Litmus

For internal workload pods and storage resilience (OpenEBS). This is to test built-in cluster resilience whilst running on 
arm64 architecture and building confidence in the design and overall architecture.  

## How do we use Litmus.  

To run on RPi based (home) Kubernetes clusters running personal production workloads.

## Benefits in using Litmus.   

([Michael Fornaro](https://www.linkedin.com/in/michael-fornaro-5b756179/), Maintainer) I reviewed several chaos tools and felt that Litmus being associated with CNCF and being an open-source tool 
aligns with my personal preference and values. It has a very active community and repository, and there was well-documented information that 
helped during the initial learning phases.
