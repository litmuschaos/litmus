package main

import (
	"context"
	"encoding/json"
	"fmt"
	y "github.com/ghodss/yaml"
	//"k8s.io/apimachinery/pkg/types"

	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/discovery/cached/memory"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/restmapper"
	"sigs.k8s.io/controller-runtime/pkg/client/config"

)

var decUnstructured = yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme)
var response = make([]{}, 11);

func main() {
	data := `[{
	  "requestid": "123",
	  "requesttype": "update",
	  "manifest": {
		  "apiVersion": "apps/v1",
		  "kind": "Deployment",
		  "metadata": {
			"name": "nginx-deployment",
			"namespace": "default"
		  },
		  "spec": {
			"selector": {
			  "matchLabels": {
				"app": "nginx"
			  }
			},
			"replicas": 2,
			"template": {
			  "metadata": {
				"labels": {
				  "app": "nginx"
				}
			  },
			  "spec": {
				"containers": [
				  {
					"name": "nginx",
					"image": "nginx:1.14.2",
					"ports": [
					  {
						"containerPort": 80
					  }
					]
				  }
				]
			  }
			}
		  }
		},
	  "resourcetype": "Deployment",
	  "namespace": "default"
	}]`

	var unstructureData []map[string]interface{}
	json.Unmarshal([]byte(data), &unstructureData)

	b, err := json.Marshal(unstructureData[0]["manifest"])
	if err != nil {
		panic(err)
	}
	//fmt.Println(string(b))

	y, err := y.JSONToYAML([]byte(b))
	if err != nil {
		fmt.Printf("err: %v\n", err)
	}

	//fmt.Println(string(y))

	cfg, err := config.GetConfig()
	if err != nil {
		fmt.Printf("err: %v\n", err)
	}

	dc, err := discovery.NewDiscoveryClientForConfig(cfg)
	if err != nil {
		fmt.Printf("err: %v\n", err)
	}
	mapper := restmapper.NewDeferredDiscoveryRESTMapper(memory.NewMemCacheClient(dc))

	// 2. Prepare the dynamic client
	dyn, err := dynamic.NewForConfig(cfg)
	if err != nil {
		fmt.Printf("err: %v\n", err)
	}

	// 3. Decode YAML manifest into unstructured.Unstructured
	obj := &unstructured.Unstructured{}
	_, gvk, err := decUnstructured.Decode([]byte(y), nil, obj)
	if err != nil {
		fmt.Printf("err: %v\n", err)
	}

	// 4. Find GVR
	mapping, err := mapper.RESTMapping(gvk.GroupKind(), gvk.Version)
	if err != nil {
		fmt.Printf("err: %v\n", err)
	}

	// 5. Obtain REST interface for the GVR
	var dr dynamic.ResourceInterface
	if mapping.Scope.Name() == meta.RESTScopeNameNamespace {
		// namespaced resources should specify the namespace
		dr = dyn.Resource(mapping.Resource).Namespace(obj.GetNamespace())
	} else {
		// for cluster-wide resources
		dr = dyn.Resource(mapping.Resource)
	}

	if (unstructureData[0]["requesttype"] == "create"){
		_, err := dr.Create(context.TODO(), obj, metav1.CreateOptions{})
		if err != nil {
			fmt.Printf("err: %v\n", err)
		}
	}

	if (unstructureData[0]["requesttype"] == "update"){
		_, err := dr.Update(context.TODO(), obj, metav1.UpdateOptions{})
		if err != nil {
			fmt.Printf("err: %v\n", err)
		}
	}

	if (unstructureData[0]["requesttype"] == "delete"){
		err := dr.Delete(context.TODO(), obj.GetName(), metav1.DeleteOptions{})
		if err != nil {
			fmt.Printf("err: %v\n", err)
		}
	}

	if (unstructureData[0]["requesttype"] == "get"){
		_, err := dr.Get(context.TODO(), obj.GetName(), metav1.GetOptions{})
		if err != nil {
			fmt.Printf("err: %v\n", err)
		}
	}

	//r, err := json.Marshal(res)
	//fmt.Print(string(r))

}