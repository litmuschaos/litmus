module github.com/litmuschaos/litmus/chaoscenter/graphql/server

go 1.16

require (
	github.com/99designs/gqlgen v0.11.3
	github.com/argoproj/argo-workflows/v3 v3.3.1
	github.com/ghodss/yaml v1.0.1-0.20190212211648-25d852aebe32
	github.com/gin-contrib/cors v1.3.1
	github.com/gin-gonic/gin v1.9.0
	github.com/go-git/go-git/v5 v5.4.2
	github.com/golang-jwt/jwt v3.2.2+incompatible
	github.com/google/uuid v1.3.0
	github.com/gorilla/websocket v1.5.0
	github.com/jinzhu/copier v0.3.5
	github.com/kelseyhightower/envconfig v1.4.0
	github.com/litmuschaos/chaos-operator v0.0.0-20230109130222-de7c74a937a9
	github.com/litmuschaos/chaos-scheduler v0.0.0-20220714173615-d7513d616a71
	github.com/litmuschaos/litmus/litmus-portal/graphql-server v0.0.0-20230515065622-4cecb9fe5d0d
	github.com/pkg/errors v0.9.1
	github.com/sirupsen/logrus v1.8.1
	github.com/stretchr/testify v1.8.2
	github.com/tidwall/gjson v1.14.0
	github.com/tidwall/sjson v1.2.4
	github.com/vektah/gqlparser/v2 v2.1.0
	go.mongodb.org/mongo-driver v1.11.4
	golang.org/x/crypto v0.5.0
	google.golang.org/grpc v1.44.0
	google.golang.org/protobuf v1.28.1
	gopkg.in/yaml.v2 v2.4.0
	k8s.io/api v0.23.3
	k8s.io/apimachinery v0.23.3
	k8s.io/client-go v12.0.0+incompatible

)

// Pinned to kubernetes-1.21.2
replace (
	k8s.io/api => k8s.io/api v0.21.2
	k8s.io/apiextensions-apiserver => k8s.io/apiextensions-apiserver v0.21.2
	k8s.io/apimachinery => k8s.io/apimachinery v0.21.2
	k8s.io/apiserver => k8s.io/apiserver v0.21.2
	k8s.io/cli-runtime => k8s.io/cli-runtime v0.21.2
	k8s.io/client-go => k8s.io/client-go v0.21.2
	k8s.io/cloud-provider => k8s.io/cloud-provider v0.21.2
	k8s.io/cluster-bootstrap => k8s.io/cluster-bootstrap v0.21.2
	k8s.io/code-generator => k8s.io/code-generator v0.21.2
	k8s.io/component-base => k8s.io/component-base v0.21.2
	k8s.io/cri-api => k8s.io/cri-api v0.21.2
	k8s.io/csi-translation-lib => k8s.io/csi-translation-lib v0.21.2
	k8s.io/kube-aggregator => k8s.io/kube-aggregator v0.21.2
	k8s.io/kube-controller-manager => k8s.io/kube-controller-manager v0.21.2
	k8s.io/kube-proxy => k8s.io/kube-proxy v0.21.2
	k8s.io/kube-scheduler => k8s.io/kube-scheduler v0.21.2
	k8s.io/kubectl => k8s.io/kubectl v0.21.2
	k8s.io/kubelet => k8s.io/kubelet v0.21.2
	k8s.io/legacy-cloud-providers => k8s.io/legacy-cloud-providers v0.21.2
	k8s.io/metrics => k8s.io/metrics v0.21.2
	k8s.io/sample-apiserver => k8s.io/sample-apiserver v0.21.2
)

replace github.com/docker/docker => github.com/moby/moby v0.7.3-0.20190826074503-38ab9da00309 // Required by Helm
