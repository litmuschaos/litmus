package k8s

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	log "github.com/sirupsen/logrus"
	v1 "k8s.io/api/core/v1"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
	memory "k8s.io/client-go/discovery/cached"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/restmapper"
)

// KubeClients is a struct for kubernetes cluster
type KubeClients struct {
	GenericClient kubernetes.Interface
	DynamicClient dynamic.Interface
	RESTMapper    meta.RESTMapper
}

// NewKubeCluster returns a new KubeClients instance
func NewKubeCluster() (*KubeClients, error) {
	config, err := GetKubeConfig()
	if err != nil {
		return nil, err
	}

	genericClient, dynamicClient, discoveryClient, err := GetK8sClients(config)
	if err != nil {
		return nil, err
	}

	RESTMapper := restmapper.NewDeferredDiscoveryRESTMapper(memory.NewMemCacheClient(discoveryClient))
	return &KubeClients{
		GenericClient: genericClient,
		DynamicClient: dynamicClient,
		RESTMapper:    RESTMapper,
	}, nil
}

// ClusterResource handles cluster operations
func (k *KubeClients) ClusterResource(manifest string, namespace string) (*unstructured.Unstructured, error) {
	var (
		decUnstructured = yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme)
		dr              dynamic.ResourceInterface
		ctx             = context.TODO()
		obj             = &unstructured.Unstructured{} // Decode YAML manifest into unstructured.Unstructured
	)
	_, gvk, err := decUnstructured.Decode([]byte(manifest), nil, obj)
	if err != nil {
		return nil, err
	}
	// Find GVR
	mapping, err := k.RESTMapper.RESTMapping(gvk.GroupKind(), gvk.Version)
	if err != nil {
		return nil, err
	}
	// Obtain REST interface for the GVR
	if mapping.Scope.Name() == meta.RESTScopeNameNamespace {
		// namespaced resources should specify the namespace
		dr = k.DynamicClient.Resource(mapping.Resource).Namespace(namespace)
	} else {
		// for cluster-wide resources
		dr = k.DynamicClient.Resource(mapping.Resource)
	}

	response, err := dr.Create(ctx, obj, metaV1.CreateOptions{})
	if k8sErrors.IsAlreadyExists(err) {
		// This doesn't ever happen even if it does already exist
		log.Info("already exists")
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	log.Info("resource successfully created")

	return response, nil
}

/*
GetServerEndpoint returns the endpoint of the server by which external agents can communicate.
The order of generating the endpoint is based on different network type:
- Ingress
- LoadBalancer > NodePort > ClusterIP
*/
func (k *KubeClients) GetServerEndpoint(portalScope utils.AgentScope, agentType utils.AgentType) (string, error) {
	var (
		nodePort          int32
		port              int32
		internalIP        string
		ingressPath       string
		ipAddress         string
		scheme            string
		finalURL          string
		serverServiceName = utils.Config.ServerServiceName
		nodeName          = utils.Config.NodeName
		litmusPortalNS    = utils.Config.LitmusPortalNamespace
		ingress           = utils.Config.Ingress
		ingressName       = utils.Config.IngressName
	)

	ctx := context.TODO()

	svc, err := k.GenericClient.CoreV1().Services(litmusPortalNS).Get(ctx, serverServiceName, metaV1.GetOptions{})
	if err != nil {
		return "", err
	}

	for _, p := range svc.Spec.Ports {
		if p.Name == "graphql-server" {
			nodePort = p.NodePort
			port = p.Port
		}
	}

	// If current agent is self-agent, then servicename FQDN will be used irrespective of service type.
	if agentType == utils.AgentTypeInternal {
		finalURL = "http://" + serverServiceName + "." + litmusPortalNS + ":" + strconv.Itoa(int(port)) + "/query"
		return finalURL, nil
	}

	// Ingress endpoint will be generated for external agents only.
	if ingress == "true" {
		getIng, err := k.GenericClient.NetworkingV1().Ingresses(litmusPortalNS).Get(ctx, ingressName, metaV1.GetOptions{})
		if err != nil {
			return "", err
		}

		/*
			Priorities of retrieving Ingress endpoint
			1. hostname
			2. IPAddress
		*/
		if len(getIng.Spec.Rules) > 0 && getIng.Spec.Rules[0].Host != "" {
			ipAddress = getIng.Spec.Rules[0].Host
		} else if len(getIng.Status.LoadBalancer.Ingress) > 0 && getIng.Status.LoadBalancer.Ingress[0].IP != "" {
			ipAddress = getIng.Status.LoadBalancer.Ingress[0].IP
		} else if len(getIng.Status.LoadBalancer.Ingress) > 0 && getIng.Status.LoadBalancer.Ingress[0].Hostname != "" {
			ipAddress = getIng.Status.LoadBalancer.Ingress[0].Hostname
		} else {
			return "", errors.New("IP Address or HostName not generated")
		}

		if ipAddress == "" {
			return "", errors.New("IP Address or Hostname is not available in the ingress of " + ingressName)
		}

		for _, rule := range getIng.Spec.Rules {
			for _, path := range rule.HTTP.Paths {
				if path.Backend.Service.Name == serverServiceName {
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

					ingressPath = strings.Join(path_arr[:], "/")
				}
			}
		}

		if len(getIng.Spec.TLS) > 0 {
			scheme = "https"
		} else {
			scheme = "http"
		}

		finalURL = scheme + "://" + wrapIPV6(ipAddress) + "/" + ingressPath

	} else if ingress == "false" || ingress == "" {

		exp := strings.ToLower(string(svc.Spec.Type))
		switch exp {
		case strings.ToLower(string(v1.ServiceTypeLoadBalancer)):
			if len(svc.Status.LoadBalancer.Ingress) > 0 {
				if svc.Status.LoadBalancer.Ingress[0].Hostname != "" {
					ipAddress = svc.Status.LoadBalancer.Ingress[0].Hostname
				} else if svc.Status.LoadBalancer.Ingress[0].IP != "" {
					ipAddress = svc.Status.LoadBalancer.Ingress[0].IP
				} else {
					return "", errors.New("LoadBalancerIP/Hostname not present for loadbalancer service type")
				}
			} else {
				return "", errors.New("LoadBalancerIP/Hostname not present for loadbalancer service type")
			}
			finalURL = "http://" + wrapIPV6(ipAddress) + ":" + strconv.Itoa(int(port)) + "/query"
		case strings.ToLower(string(v1.ServiceTypeNodePort)):
			// Cannot fetch Node Ip Address when ChaosCenter is installed in Namespaced scope
			if portalScope == utils.AgentScopeNamespace {
				return "", errors.New("Cannot get NodeIP in namespaced mode")
			}

			nodeIP, err := k.GenericClient.CoreV1().Nodes().Get(ctx, nodeName, metaV1.GetOptions{})
			if err != nil {
				return "", err
			}

			for _, addr := range nodeIP.Status.Addresses {
				if strings.ToLower(string(addr.Type)) == "externalip" && addr.Address != "" {
					ipAddress = addr.Address
				} else if strings.ToLower(string(addr.Type)) == "internalip" && addr.Address != "" {
					internalIP = addr.Address
				}
			}

			// Whichever one of External IP and Internal IP is present, that will be selected for Server Endpoint
			if ipAddress != "" {
				finalURL = "http://" + wrapIPV6(ipAddress) + ":" + strconv.Itoa(int(nodePort)) + "/query"
			} else if internalIP != "" {
				finalURL = "http://" + wrapIPV6(internalIP) + ":" + strconv.Itoa(int(nodePort)) + "/query"
			} else {
				return "", errors.New("both ExternalIP and InternalIP aren't present for NodePort service type")
			}
		case strings.ToLower(string(v1.ServiceTypeClusterIP)):
			log.Info("external agents can't be connected to the server if the service type is set to ClusterIP\n")
			if svc.Spec.ClusterIP == "" {
				return "", errors.New("ClusterIP is not present")
			}
			finalURL = "http://" + wrapIPV6(svc.Spec.ClusterIP) + ":" + strconv.Itoa(int(port)) + "/query"
		default:
			return "", errors.New("no service type found")
		}
	} else {
		return "", errors.New("ingress value is not correct")
	}

	log.Info("server endpoint: ", finalURL)

	return finalURL, nil
}

// GetTLSCert returns the TLS certificate of the provided secret
func (k *KubeClients) GetTLSCert(secretName string) (string, error) {
	secret, err := k.GenericClient.CoreV1().Secrets(utils.Config.LitmusPortalNamespace).Get(context.Background(), secretName, metaV1.GetOptions{})
	if err != nil {
		return "", err
	}

	if cert, ok := secret.Data["tls.crt"]; ok {
		return base64.StdEncoding.EncodeToString(cert), nil
	}
	return "", fmt.Errorf("could not find tls.crt value in provided TLS Secret %v", secretName)
}

// wrapIPV6 wraps ipv6 address in square brackets
func wrapIPV6(addr string) string {
	if strings.Count(addr, ":") > 0 {
		return "[" + addr + "]"
	}
	return addr
}
