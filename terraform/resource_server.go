package main
import (
        "github.com/hashicorp/terraform-plugin-sdk/helper/schema"
        crud "main/crud"
)
func resourceServer() *schema.Resource {
        return &schema.Resource{
                Create: resourceServerCreate,
                Read:   resourceServerRead,
                Update: resourceServerUpdate,
                Delete: resourceServerDelete,
                Schema: map[string]*schema.Schema{
                        "kubeconfig":{
                                Type:     schema.TypeString,
                                Optional: true,
                                Default:  "~/.kube/config",
                        },
                },
        }
}
func resourceServerCreate(d *schema.ResourceData, m interface{}) error {
        kubeconfig := d.Get("kubeconfig").(string)
        d.Set("kubeconfig", kubeconfig)
        return crud.Create()
}
func resourceServerRead(d *schema.ResourceData, m interface{}) error {
        return nil
}
func resourceServerUpdate(d *schema.ResourceData, m interface{}) error {
        return nil
}
func resourceServerDelete(d *schema.ResourceData, m interface{}) error {
        return nil
}
