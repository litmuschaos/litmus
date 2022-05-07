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