package k8s

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	k8serrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
	memory "k8s.io/client-go/discovery/cached"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/restmapper"
)

var (
	decUnstructured = yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme)
	dr              dynamic.ResourceInterface
)

// InfraResource This function handles cluster operations
func InfraResource(manifest string, namespace string) (*unstructured.Unstructured, error) {
	// Getting dynamic and discovery client
	ctx := context.TODO()
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

	response, err := dr.Create(ctx, obj, metaV1.CreateOptions{})
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
func GetServerEndpoint(portalScope, agentType string) (string, error) {
	var (
		NodePort          int32
		Port              int32
		InternalIP        string
		IngressPath       string
		IPAddress         string
		Scheme            string
		FinalUrl          string
		ServerServiceName = utils.Config.ServerServiceName
		NodeName          = utils.Config.NodeName
		LitmusPortalNS    = utils.Config.LitmusPortalNamespace
		Ingress           = utils.Config.Ingress
		IngressName       = utils.Config.IngressName
	)

	ctx := context.TODO()
	clientset, err := GetGenericK8sClient()
	if err != nil {
		return "", err
	}

	svc, err := clientset.CoreV1().Services(LitmusPortalNS).Get(ctx, ServerServiceName, metaV1.GetOptions{})
	if err != nil {
		return "", err
	}

	for _, port := range svc.Spec.Ports {
		if port.Name == "graphql-server" {
			NodePort = port.NodePort
			Port = port.Port
		}
	}

	// If current agent is self-agent, then servicename FQDN will be used irrespective of service type.
	if agentType == "internal" {
		FinalUrl = "http://" + ServerServiceName + "." + LitmusPortalNS + ":" + strconv.Itoa(int(Port)) + "/query"
		return FinalUrl, nil
	}

	// Ingress endpoint will be generated for external agents only.
	if Ingress == "true" {
		getIng, err := clientset.NetworkingV1().Ingresses(LitmusPortalNS).Get(ctx, IngressName, metaV1.GetOptions{})
		if err != nil {
			return "", err
		}

		/*
			Priorities of retrieving Ingress endpoint
			1. hostname
			2. IPAddress
		*/
		if len(getIng.Spec.Rules) > 0 && getIng.Spec.Rules[0].Host != "" {
			IPAddress = getIng.Spec.Rules[0].Host
		} else if len(getIng.Status.LoadBalancer.Ingress) > 0 && getIng.Status.LoadBalancer.Ingress[0].IP != "" {
			IPAddress = getIng.Status.LoadBalancer.Ingress[0].IP
		} else if len(getIng.Status.LoadBalancer.Ingress) > 0 && getIng.Status.LoadBalancer.Ingress[0].Hostname != "" {
			IPAddress = getIng.Status.LoadBalancer.Ingress[0].Hostname
		} else {
			return "", errors.New("IP Address or HostName not generated")
		}

		if IPAddress == "" {
			return "", errors.New("IP Address or Hostname is not available in the ingress of " + IngressName)
		}

		for _, rule := range getIng.Spec.Rules {
			for _, path := range rule.HTTP.Paths {
				if path.Backend.Service.Name == ServerServiceName {
					f := func(c rune) bool {
						return c == '/'
					}

					path_arr := strings.FieldsFunc(path.Path, f)
					if len(path_arr) > 0 {
						if path_arr[len(path_arr)-1] == "(.*)" {
							path_arr[len(path_arr)-1] = "query"
						} else {
							path_arr = append(path_arr, "query")
						}
					} else {
						path_arr = append(path_arr, "query")
					}

					IngressPath = strings.Join(path_arr[:], "/")
				}
			}
		}

		if len(getIng.Spec.TLS) > 0 {
			Scheme = "https"
		} else {
			Scheme = "http"
		}

		FinalUrl = Scheme + "://" + wrapIPV6(IPAddress) + "/" + IngressPath

	} else if Ingress == "false" || Ingress == "" {

		exp := strings.ToLower(string(svc.Spec.Type))
		switch exp {
		case "loadbalancer":
			if len(svc.Status.LoadBalancer.Ingress) > 0 {
				if svc.Status.LoadBalancer.Ingress[0].Hostname != "" {
					IPAddress = svc.Status.LoadBalancer.Ingress[0].Hostname
				} else if svc.Status.LoadBalancer.Ingress[0].IP != "" {
					IPAddress = svc.Status.LoadBalancer.Ingress[0].IP
				} else {
					return "", errors.New("LoadBalancerIP/Hostname not present for loadbalancer service type")
				}
			} else {
				return "", errors.New("LoadBalancerIP/Hostname not present for loadbalancer service type")
			}
			FinalUrl = "http://" + wrapIPV6(IPAddress) + ":" + strconv.Itoa(int(Port)) + "/query"
		case "nodeport":

			// Cannot fetch Node Ip Address when ChaosCenter is installed in Namespaced scope
			if portalScope == "namespace" {
				return "", errors.New("Cannot get NodeIP in namespaced mode")
			}

			nodeIP, err := clientset.CoreV1().Nodes().Get(ctx, NodeName, metaV1.GetOptions{})
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

			// Whichever one of External IP and Internal IP is present, that will be selected for Server Endpoint
			if IPAddress != "" {
				FinalUrl = "http://" + wrapIPV6(IPAddress) + ":" + strconv.Itoa(int(NodePort)) + "/query"
			} else if InternalIP != "" {
				FinalUrl = "http://" + wrapIPV6(InternalIP) + ":" + strconv.Itoa(int(NodePort)) + "/query"
			} else {
				return "", errors.New("Both ExternalIP and InternalIP aren't present for NodePort service type")
			}
		case "clusterip":
			log.Print("External agents can't be connected to the server if the service type is set to ClusterIP\n")
			if svc.Spec.ClusterIP == "" {
				return "", errors.New("ClusterIP is not present")
			}
			FinalUrl = "http://" + wrapIPV6(svc.Spec.ClusterIP) + ":" + strconv.Itoa(int(Port)) + "/query"
		default:
			return "", errors.New("No service type found")
		}
	} else {
		return "", errors.New("Ingress value is not correct")
	}

	log.Print("Server endpoint: ", FinalUrl)

	return FinalUrl, nil
}

func wrapIPV6(addr string) string {
	if strings.Count(addr, ":") > 0 {
		return "[" + addr + "]"
	}
	return addr
}

func GetTLSCert(secretName string) (string, error) {
	clientset, err := GetGenericK8sClient()
	if err != nil {
		return "", err
	}

	secret, err := clientset.CoreV1().Secrets(utils.Config.LitmusPortalNamespace).Get(context.Background(), secretName, metaV1.GetOptions{})
	if err != nil {
		return "", err
	}

	if cert, ok := secret.Data["tls.crt"]; ok {
		return base64.StdEncoding.EncodeToString(cert), nil
	}
	return "", fmt.Errorf("could not find tls.crt value in provided TLS Secret %v", secretName)
}
