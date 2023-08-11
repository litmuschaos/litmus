package utils

//Add required field at the start of the struct

type Configurations struct {
	JwtSecret                    string `required:"true" envconfig:"JWT_SECRET"`
	AdminUserName                string `required:"true" envconfig:"ADMIN_USERNAME"`
	AdminPassword                string `required:"true" envconfig:"ADMIN_PASSWORD"`
	DbServer                     string `required:"true" envconfig:"DB_SERVER"`
	DbUser                       string `required:"true" envconfig:"DB_USER"`
	DbPassword                   string `required:"true" envconfig:"DB_PASSWORD"`
	DbName                       string `envconfig:"DB_NAME" default:"auth"`
	Port                         string `required:"true" default:":3000"`
	GrpcPort                     string `required:"true" default:":3030"`
	UserCollection               string `required:"true" default:"users"`
	ProjectCollection            string `required:"true" default:"project"`
	UsernameField                string `required:"true" default:"username"`
	PasswordEncryptionCost       int    `required:"true" default:"15"`
	DefaultLitmusGqlGrpcEndpoint string `required:"true" default:"localhost"`
	DefaultLitmusGqlGrpcPort     string `required:"true" default:":8000"`
	JwtExpiryDuration            int    `envconfig:"JWT_EXPIRY_MINS" default:"1440"`
	OAuthJWTExpDuration          int    `envconfig:"OAUTH_JWT_EXP_MINS" default:"5"`
	OAuthJwtSecret               string `envconfig:"OAUTH_SECRET"`
	StrictPassword               bool   `envconfig:"STRICT_PASSWORD_POLICY" default:"false"`
	DexEnabled                   bool   `envconfig:"DEX_ENABLED" default:"false"`
	DexCallBackURL               string `envconfig:"DEX_OAUTH_CALLBACK_URL"`
	DexClientID                  string `envconfig:"DEX_OAUTH_CLIENT_ID"`
	DexClientSecret              string `envconfig:"DEX_OAUTH_CLIENT_SECRET"`
	DexOIDCIssuer                string `envconfig:"OIDC_ISSUER"`
	LitmusGqlGrpcEndpoint        string `envconfig:"LITMUS_GQL_GRPC_ENDPOINT"`
	LitmusGqlGrpcPort            string `envconfig:"LITMUS_GQL_GRPC_PORT"`
}

var Config Configurations
