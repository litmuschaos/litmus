package k8s_test

import (
	"context"
	"os"
	"testing"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/stretchr/testify/assert"
	v1 "k8s.io/api/core/v1"
	networkingV1 "k8s.io/api/networking/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/intstr"
	fakeDynamic "k8s.io/client-go/dynamic/fake"
	fakeClientSet "k8s.io/client-go/kubernetes/fake"
	"k8s.io/client-go/restmapper"
)

// TestNewKubeCluster tests the NewKubeCluster function
func TestNewKubeCluster(t *testing.T) {
	// given
	testcases := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "failure: invalid KubeConfig path",
			wantErr: true,
		},
		{
			name:    "success",
			wantErr: false,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if tc.wantErr {
				// given
				utils.Config.KubeConfigFilePath = "invalid path"
				// when
				_, err := k8s.GetKubeConfig()
				// then
				assert.Error(t, err)
			} else {
				// given
				content := `
apiVersion: v1
clusters:
- cluster:
    server: https://localhost:8080
    extensions:
    - name: client.authentication.k8s.io/exec
      extension:
        audience: foo
        other: bar
  name: foo-cluster
contexts:
- context:
    cluster: foo-cluster
    user: foo-user
    namespace: bar
  name: foo-context
current-context: foo-context
kind: Config
users:
- name: foo-user
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1alpha1
      args:
      - arg-1
      - arg-2
      command: foo-command
      provideClusterInfo: true
`
				err := os.MkdirAll(tempPath, os.ModePerm)
				if err != nil {
					t.Error(err)
				}
				tmpFile, err := os.Create(tempPath + "kubeconfig")
				if err != nil {
					t.Error(err)
				}
				t.Cleanup(func() { _ = os.Remove(tempPath + "kubeconfig") })
				if err := os.WriteFile(tmpFile.Name(), []byte(content), 0666); err != nil {
					t.Error(err)
				}
				utils.Config.KubeConfigFilePath = tmpFile.Name()
				// when
				_, err = k8s.NewKubeCluster()
				// then
				assert.NoError(t, err)
			}
		})
	}
}

// TestClusterResource tests the ClusterResource function
func TestClusterResource(t *testing.T) {
	// given
	validManifest := `
apiVersion: v1
kind: Service
metadata:
  name: litmusportal-server-service
  namespace: some-ns
spec:
  type: NodePort
  ports:
    - name: graphql-server
      port: 9002
      targetPort: 8080
    - name: graphql-rpc-server
      port: 8000
      targetPort: 8000
  selector:
    component: litmusportal-server
`
	utils.Config.LitmusPortalNamespace = "some-ns"
	type args struct {
		manifest  string
		resources []*restmapper.APIGroupResources
	}
	testcases := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{
			name: "success",
			args: args{
				manifest: validManifest,
				resources: []*restmapper.APIGroupResources{
					{
						Group: metaV1.APIGroup{
							Versions: []metaV1.GroupVersionForDiscovery{
								{Version: "v1"},
							},
							PreferredVersion: metaV1.GroupVersionForDiscovery{Version: "v1"},
						},
						VersionedResources: map[string][]metaV1.APIResource{
							"v1": {
								{Name: "services", Namespaced: true, Kind: "Service"},
							},
						},
					},
				},
			},
		},
		{
			name: "failure: invalid manifest",
			args: args{
				manifest: "invalid yaml",
			},
			wantErr: true,
		},
		{
			name: "failure: cannot find GVR",
			args: args{
				manifest: validManifest,
				resources: []*restmapper.APIGroupResources{
					{
						Group: metaV1.APIGroup{
							Versions: []metaV1.GroupVersionForDiscovery{
								{Version: "v1"},
							},
							PreferredVersion: metaV1.GroupVersionForDiscovery{Version: "v1"},
						},
						VersionedResources: map[string][]metaV1.APIResource{
							"v1": {},
						},
					},
				},
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			genericClient := fakeClientSet.NewSimpleClientset()
			dynamicClient := fakeDynamic.NewSimpleDynamicClient(runtime.NewScheme())
			restMapper := restmapper.NewDiscoveryRESTMapper(tc.args.resources)
			client := &k8s.KubeClients{
				GenericClient: genericClient,
				DynamicClient: dynamicClient,
				RESTMapper:    restMapper,
			}
			// when
			_, err := client.ClusterResource(tc.args.manifest, utils.Config.LitmusPortalNamespace)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// getServiceObject returns a service object
func getServiceObject(serviceType v1.ServiceType) *v1.Service {
	service := &v1.Service{
		TypeMeta: metaV1.TypeMeta{
			Kind:       "Service",
			APIVersion: "v1",
		},
		ObjectMeta: metaV1.ObjectMeta{
			Name:      utils.Config.ServerServiceName,
			Namespace: utils.Config.LitmusPortalNamespace,
		},
		Spec: v1.ServiceSpec{
			Ports: []v1.ServicePort{
				{
					Name:     "graphql-server",
					Protocol: "",
					Port:     9002,
					TargetPort: intstr.IntOrString{
						Type:   0,
						IntVal: 8080,
					},
				},
				{
					Name:     "graphql-rpc-server",
					Protocol: "",
					Port:     8000,
					TargetPort: intstr.IntOrString{
						Type:   0,
						IntVal: 8000,
					},
				},
			},
			Type: serviceType,
			Selector: map[string]string{
				"component": "litmusportal-server",
			},
		},
	}
	switch serviceType {
	case v1.ServiceTypeNodePort:
		service.Spec.Ports[0].NodePort = 31001
	case v1.ServiceTypeClusterIP:
		service.Spec.ClusterIP = "1.1.1.1"
	}
	return service
}

// getServiceTypeLoadBalancerObject returns a service object with load balancer type
func getServiceTypeLoadBalancerObject(ip, hostname string) *v1.Service {
	service := getServiceObject(v1.ServiceTypeLoadBalancer)
	if ip != "" || hostname != "" {
		service.Status.LoadBalancer.Ingress = []v1.LoadBalancerIngress{{IP: ip, Hostname: hostname}}
	}
	return service
}

// getNodeObject returns a node object
func getNodeObject(nodeAddressType v1.NodeAddressType) *v1.Node {
	return &v1.Node{
		ObjectMeta: metaV1.ObjectMeta{
			Name: uuid.NewString(),
		},
		Status: v1.NodeStatus{
			Addresses: []v1.NodeAddress{
				{
					Type:    nodeAddressType,
					Address: "1.2.3.4",
				},
			},
		},
	}
}

// getIngressObject returns an ingress object
func getIngressObject(ruleHostnameExist bool, ip, hostname string) *networkingV1.Ingress {
	ruleHostname := ""
	if ruleHostnameExist {
		ruleHostname = "hostname.com"
	}
	ingress := &networkingV1.Ingress{
		ObjectMeta: metaV1.ObjectMeta{
			Name:      uuid.NewString(),
			Namespace: utils.Config.LitmusPortalNamespace,
		},
		Spec: networkingV1.IngressSpec{
			Rules: []networkingV1.IngressRule{
				{
					Host: ruleHostname,
					IngressRuleValue: networkingV1.IngressRuleValue{
						HTTP: &networkingV1.HTTPIngressRuleValue{
							Paths: []networkingV1.HTTPIngressPath{
								{
									Path: "/", Backend: networkingV1.IngressBackend{
										Service: &networkingV1.IngressServiceBackend{
											Name: utils.Config.ServerServiceName,
											Port: networkingV1.ServiceBackendPort{
												Number: 9002,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}
	if ip != "" || hostname != "" {
		ingress.Status.LoadBalancer.Ingress = []v1.LoadBalancerIngress{{IP: ip, Hostname: hostname}}
	}
	return ingress
}

// TestGetServerEndpoint tests the GetServerEndpoint function
func TestGetServerEndpoint(t *testing.T) {
	// given
	genericClient := fakeClientSet.NewSimpleClientset()
	client := &k8s.KubeClients{GenericClient: genericClient}
	utils.Config.LitmusPortalNamespace = "some-ns"
	utils.Config.ServerServiceName = "litmusportal-server-service"
	type args struct {
		portalScope utils.AgentScope
		agentType   utils.AgentType
		service     *v1.Service
	}
	testcases := []struct {
		name    string
		args    args
		given   func()
		want    string
		wantErr bool
	}{
		{
			name: "success: self agent",
			args: args{
				portalScope: utils.AgentScopeNamespace,
				agentType:   utils.AgentTypeInternal,
				service:     getServiceObject(v1.ServiceTypeNodePort),
			},
			given:   func() {},
			want:    "http://litmusportal-server-service.some-ns:9002/query",
			wantErr: false,
		},
		{
			name: "failure: external agent & Ingress is absent & service type is NodePort but portal scope is namespace",
			args: args{
				portalScope: utils.AgentScopeNamespace,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceObject(v1.ServiceTypeNodePort),
			},
			given:   func() {},
			wantErr: true,
		},
		{
			name: "failure: external agent & Ingress is absent & service type is NodePort but cannot find node name",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceObject(v1.ServiceTypeNodePort),
			},
			given:   func() {},
			wantErr: true,
		},
		{
			name: "success: external agent & Ingress is absent & service type is NodePort and address type is ExternalIP",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceObject(v1.ServiceTypeNodePort),
			},
			given: func() {
				node := getNodeObject(v1.NodeExternalIP)
				_, err := client.GenericClient.CoreV1().Nodes().Create(context.Background(), node, metaV1.CreateOptions{})
				if err != nil {
					t.FailNow()
				}
				utils.Config.NodeName = node.Name
			},
			want:    "http://1.2.3.4:31001/query",
			wantErr: false,
		},
		{
			name: "success: external agent & Ingress is absent & service type is NodePort and address type is InternalIP",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceObject(v1.ServiceTypeNodePort),
			},
			given: func() {
				node := getNodeObject(v1.NodeInternalIP)
				_, err := client.GenericClient.CoreV1().Nodes().Create(context.Background(), node, metaV1.CreateOptions{})
				if err != nil {
					t.FailNow()
				}
				utils.Config.NodeName = node.Name
			},
			want:    "http://1.2.3.4:31001/query",
			wantErr: false,
		},
		{
			name: "success: external agent & Ingress is absent & service type is ClusterIP",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceObject(v1.ServiceTypeClusterIP),
			},
			given:   func() {},
			want:    "http://1.1.1.1:9002/query",
			wantErr: false,
		},
		{
			name: "failure: external agent & Ingress is absent but service type not found",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceObject("invalid serviceType"),
			},
			given:   func() {},
			wantErr: true,
		},
		{
			name: "failure: external agent & invalid ingress value",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceObject(v1.ServiceTypeNodePort),
			},
			given: func() {
				utils.Config.Ingress = "invalid value"
			},
			wantErr: true,
		},
		{
			name: "failure: external agent & Ingress is absent & service type is LoadBalancer but LoadBalancerIP/Hostname not present",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceTypeLoadBalancerObject("", ""),
			},
			given: func() {
				utils.Config.Ingress = "false"
			},
			wantErr: true,
		},
		{
			name: "success: external agent & Ingress is absent & service type is LoadBalancer and hostname is present",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceTypeLoadBalancerObject("", "hostname.com"),
			},
			given:   func() {},
			want:    "http://hostname.com:9002/query",
			wantErr: false,
		},
		{
			name: "success: external agent & Ingress is absent & service type is LoadBalancer and ip is present",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceTypeLoadBalancerObject("1.1.1.1", ""),
			},
			given:   func() {},
			want:    "http://1.1.1.1:9002/query",
			wantErr: false,
		},
		{
			name: "failure: external agent & Ingress is present but cannot get ingress",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceObject(v1.ServiceTypeNodePort),
			},
			given: func() {
				utils.Config.Ingress = "true"
			},
			wantErr: true,
		},
		{
			name: "success: external agent & Ingress is present",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceObject(v1.ServiceTypeNodePort),
			},
			given: func() {
				utils.Config.Ingress = "true"
				ingress := getIngressObject(true, "", "")
				_, err := client.GenericClient.NetworkingV1().Ingresses(utils.Config.LitmusPortalNamespace).Create(context.Background(), ingress, metaV1.CreateOptions{})
				if err != nil {
					t.FailNow()
				}
				utils.Config.IngressName = ingress.Name
			},
			want:    "http://hostname.com/query",
			wantErr: false,
		},
		{
			name: "success: external agent & Ingress is present and ingress hostname is present",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceObject(v1.ServiceTypeNodePort),
			},
			given: func() {
				utils.Config.Ingress = "true"
				ingress := getIngressObject(false, "", "hostname.com")
				_, err := client.GenericClient.NetworkingV1().Ingresses(utils.Config.LitmusPortalNamespace).Create(context.Background(), ingress, metaV1.CreateOptions{})
				if err != nil {
					t.FailNow()
				}
				utils.Config.IngressName = ingress.Name
			},
			want:    "http://hostname.com/query",
			wantErr: false,
		},
		{
			name: "success: external agent & Ingress is present and ingress ip is present",
			args: args{
				portalScope: utils.AgentScopeCluster,
				agentType:   utils.AgentTypeExternal,
				service:     getServiceObject(v1.ServiceTypeNodePort),
			},
			given: func() {
				utils.Config.Ingress = "true"
				ingress := getIngressObject(false, "1.2.3.4", "")
				_, err := client.GenericClient.NetworkingV1().Ingresses(utils.Config.LitmusPortalNamespace).Create(context.Background(), ingress, metaV1.CreateOptions{})
				if err != nil {
					t.FailNow()
				}
				utils.Config.IngressName = ingress.Name
			},
			want:    "http://1.2.3.4/query",
			wantErr: false,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			_, err := client.GenericClient.CoreV1().Services(utils.Config.LitmusPortalNamespace).Create(context.Background(), tc.args.service, metaV1.CreateOptions{})
			if err != nil {
				t.FailNow()
			}
			t.Cleanup(func() {
				_ = client.GenericClient.CoreV1().Services(utils.Config.LitmusPortalNamespace).Delete(context.Background(), utils.Config.ServerServiceName, metaV1.DeleteOptions{})
			})
			// when
			endpoint, err := client.GetServerEndpoint(tc.args.portalScope, tc.args.agentType)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tc.want, endpoint)
			}
		})
	}
}

// TestGetTLSCert tests the GetTLSCert function
func TestGetTLSCert(t *testing.T) {
	// given
	genericClient := fakeClientSet.NewSimpleClientset()
	client := &k8s.KubeClients{GenericClient: genericClient}
	utils.Config.LitmusPortalNamespace = uuid.NewString()

	testcases := []struct {
		name    string
		given   func() string
		wantErr bool
	}{
		{
			name: "success",
			given: func() string {
				secretName, secretData := "tls.crt", []byte(uuid.NewString())
				secret, err := client.GenericClient.CoreV1().Secrets(utils.Config.LitmusPortalNamespace).Create(context.Background(), &v1.Secret{
					Data: map[string][]byte{secretName: secretData},
					Type: v1.SecretTypeTLS,
				}, metaV1.CreateOptions{})
				if err != nil {
					t.FailNow()
				}
				return secret.Name
			},
			wantErr: false,
		},
		{
			name: "failure: secret not found",
			given: func() string {
				return uuid.NewString()
			},
			wantErr: true,
		},
		{
			name: "failure: cannot find tls.crt",
			given: func() string {
				secretName, secretData := "invalid", []byte(uuid.NewString())
				secret, err := client.GenericClient.CoreV1().Secrets(utils.Config.LitmusPortalNamespace).Create(context.Background(), &v1.Secret{
					Data: map[string][]byte{secretName: secretData},
					Type: v1.SecretTypeTLS,
				}, metaV1.CreateOptions{})
				if err != nil {
					t.FailNow()
				}
				return secret.Name
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			objectName := tc.given()
			t.Cleanup(func() {
				client.GenericClient.CoreV1().Secrets(utils.Config.LitmusPortalNamespace).Delete(context.Background(), objectName, metaV1.DeleteOptions{})
			})
			// when
			_, err := client.GetTLSCert(objectName)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
