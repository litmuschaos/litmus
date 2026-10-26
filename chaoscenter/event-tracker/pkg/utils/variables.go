package utils

type Envs struct {
	Version          string `required:"true"`
	InfraScope       string `required:"true" split_words:"true"`
	IsInfraConfirmed string `required:"true" split_words:"true"`
	AccessKey        string `required:"true" split_words:"true"`
	InfraId          string `required:"true" split_words:"true"`
	ServerAddr       string `required:"true" split_words:"true"`
	InfraNamespace   string `required:"true" split_words:"true"`
	CustomTLSCert    string `envconfig:"CUSTOM_TLS_CERT" split_words:"true"`
	SkipSSLVerify    bool   `default:"false" split_words:"true"`
}

var Config Envs
