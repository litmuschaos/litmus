# This is required for Terraform 0.13+
terraform {
  required_providers {
    example = {
      version = "~> 1.0.0"
      source  = "kitarp.com/trying/example"
    }
  }
}
resource "example_server" "my-server" {
  kubeconfig = "~/.kube/config"
}

