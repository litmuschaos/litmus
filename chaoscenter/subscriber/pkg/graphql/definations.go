package graphql

type SubscriberGql interface {
	SendRequest(server string, payload []byte) (string, error)
	MarshalGQLData(gqlData interface{}) (string, error)
}

type subscriberGql struct {
}

func NewSubscriberGql() SubscriberGql {
	return &subscriberGql{}
}
