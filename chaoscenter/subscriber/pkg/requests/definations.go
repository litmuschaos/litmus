package requests

import (
	"subscriber/pkg/graphql"
	"subscriber/pkg/k8s"
)

var gqlSubscriberServer = graphql.NewGqlServer()
var subscriberK8s = k8s.NewKubernetes()
