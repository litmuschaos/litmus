package main
import (
        "github.com/hashicorp/terraform-plugin-sdk/helper/schema"
)
func Provider() *schema.Provider {
        // this is the provider file
        return &schema.Provider{
                ResourcesMap: map[string]*schema.Resource{
                        "example_server": resourceServer(),
                },
        }
}
