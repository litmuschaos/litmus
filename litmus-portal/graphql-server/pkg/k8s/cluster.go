package k8s

import (
	"log"
	"os"
	"strconv"
	"strings"

	"errors"

	k8serrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/restmapper"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	memory "k8s.io/client-go/discovery/cached"
)

var (
	decUnstructured = yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme)
	dr              dynamic.ResourceInterface
	AgentNamespace  = os.Getenv("AGENT_NAMESPACE")
)

// This function handles cluster operations
func ClusterResource(manifest string, namespace string) (*unstructured.Unstructured, error) {
	// Getting dynamic and discovery client
	discoveryClient, dynamicClient, err := GetDynamicAndDiscoveryClient()
	if err != nil {
		return nil, err
	}

	// Create a mapper using dynamic client
	mapper := restmapper.NewDeferredDiscoveryRESTMapper(memory.NewMemCacheClient(discoveryClient))

	// Decode YAML manifest into unstructured.Unstructured
	obj := &unstructured.Unstructured{}
	_, gvk, err := decUnstructured.Decode([]byte(manifest), nil, obj)
	if err != nil {
		return nil, err
	}

	// Find GVR
	mapping, err := mapper.RESTMapping(gvk.GroupKind(), gvk.Version)
	if err != nil {
		return nil, err
	}

	// Obtain REST interface for the GVR
	if mapping.Scope.Name() == meta.RESTScopeNameNamespace {
		// namespaced resources should specify the namespace
		dr = dynamicClient.Resource(mapping.Resource).Namespace(namespace)
	} else {
		// for cluster-wide resources
		dr = dynamicClient.Resource(mapping.Resource)
	}

	response, err := dr.Create(obj, metaV1.CreateOptions{})
	if k8serrors.IsAlreadyExists(err) {
		// This doesnt ever happen even if it does already exist
		log.Print("Already exists")
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	log.Println("Resource successfully created")

	return response, nil
}

/*
	This function returns the endpoint of the server by which external agents can communicate.
	The order of generating the endpoint is based on different network type:
	- Ingress
	- LoadBalancer > NodePort > ClusterIP
*/
func GetServerEndpoint() (string, error) {
	var (
		NodePort          int32
		Port              int32
		InternalIP        string
		IngressPath       string
		IPAddress         string
		Scheme            string
		FinalUrl          string
		ServerServiceName = os.Getenv("SERVER_SERVICE_NAME")
		NodeName          = os.Getenv("NODE_NAME")
		LitmusPortalNS    = os.Getenv("LITMUS_PORTAL_NAMESPACE")
		Ingress           = os.Getenv("INGRESS")
		IngressName       = os.Getenv("INGRESS_NAME")
	)

	clientset, err := GetGenericK8sClient()
	if err != nil {
		return "", err
	}

	if Ingress == "true" {
		getIng, err := clientset.ExtensionsV1beta1().Ingresses(LitmusPortalNS).Get(IngressName, metaV1.GetOptions{})
		if err != nil {
			return "", err
		}

		/*
			Priorities of retrieving Ingress endpoint
			1. hostname
			2. IPAddress
		*/

		if len(getIng.Status.LoadBalancer.Ingress) > 0 {
			if len(getIng.Spec.Rules) > 0 {
				if getIng.Spec.Rules[0].Host != "" {
					IPAddress = getIng.Spec.Rules[0].Host
				} else if getIng.Status.LoadBalancer.Ingress[0].IP != "" {
					IPAddress = getIng.Status.LoadBalancer.Ingress[0].IP
				}
			} else {
				return "", errors.New("Ingress rules are not present")
			}
		} else {
			return "", errors.New("IP Address or HostName not generated")
		}

		if IPAddress == "" {
			return "", errors.New("IP Address or Hostname is not available in the ingress of " + IngressName)
		}

		for _, rule := range getIng.Spec.Rules {
			for _, path := range rule.HTTP.Paths {
				if path.Backend.ServiceName == ServerServiceName {
					log.Print(path.Path)
					path_arr := strings.Split(path.Path, "/")
					if path_arr[len(path_arr)-1] == "(.*)" {
						path_arr[len(path_arr)-1] = "query"
					} else {
						path_arr = append(path_arr, "query")
					}

					log.Print(path_arr)
					for el, p := range path_arr {
						if p != "" {
							if el == len(path_arr)-1 {
								IngressPath += p
							} else {
								IngressPath += p + "/"
							}
						}
					}
				}
			}
		}

		if len(getIng.Spec.TLS) > 0 {
			Scheme = "https"
		} else {
			Scheme = "http"
		}

		FinalUrl = Scheme + "://" + IPAddress + "/" + IngressPath

	} else if Ingress == "false" || Ingress == "" {

		svc, err := clientset.CoreV1().Services(LitmusPortalNS).Get(ServerServiceName, metaV1.GetOptions{})
		if err != nil {
			return "", err
		}

		for _, port := range svc.Spec.Ports {
			if port.Name == "graphql-server" {
				NodePort = port.NodePort
				Port = port.Port
			}
		}

		if strings.ToLower(string(svc.Spec.Type)) == "loadbalancer" {
			log.Print("loadbalancer")
			IPAddress = svc.Spec.LoadBalancerIP
			if IPAddress == "" {
				return "", errors.New("ExternalIP is not present for loadbalancer service type")
			}
			FinalUrl = "http://" + IPAddress + ":" + strconv.Itoa(int(Port))
		} else if strings.ToLower(string(svc.Spec.Type)) == "nodeport" {
			nodeIP, err := clientset.CoreV1().Nodes().Get(NodeName, metaV1.GetOptions{})
			if err != nil {
				return "", err
			}

			for _, addr := range nodeIP.Status.Addresses {
				if strings.ToLower(string(addr.Type)) == "externalip" && addr.Address != "" {
					IPAddress = addr.Address
				} else if strings.ToLower(string(addr.Type)) == "internalip" && addr.Address != "" {
					InternalIP = addr.Address
				}
			}

			if IPAddress == "" {
				FinalUrl = "http://" + InternalIP + ":" + strconv.Itoa(int(NodePort))
			} else if InternalIP == "" {
				FinalUrl = "http://" + IPAddress + ":" + strconv.Itoa(int(NodePort))
			} else {
				return "", errors.New("Both ExternalIP and InternalIP aren't present for NodePort service type")
			}
		} else if strings.ToLower(string(svc.Spec.Type)) == "clusterip" {
			log.Print("External agents can't be connected to the server if the service type is set to ClusterIP\n")
			if svc.Spec.ClusterIP == "" {
				return "", errors.New("ClusterIP is not present")
			}
			FinalUrl = "http://" + svc.Spec.ClusterIP + ":" + strconv.Itoa(int(Port))
		} else {
			return "", errors.New("No service type found")
		}
	}

	log.Print("Server endpoint: ", FinalUrl)

	return FinalUrl, nil
}
