/*
Current Approach to provision Litmus on any Kubernetes Cluster using Terraform.
This is a Terraform Script that uses Helm Provider to install Litmus in any loacal cluster.
*/
provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

resource "helm_release" "litmus" {
  name       = "litmus"
  repository = "https://litmuschaos.github.io/litmus-helm/"
  chart      = "litmus"
  create_namespace = true
  namespace = "litmus" 
}

