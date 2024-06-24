package utils

import (
	"crypto/tls"
	"crypto/x509"
	"os"
	"strconv"

	log "github.com/sirupsen/logrus"
)

var (
	JwtSecret                    = os.Getenv("JWT_SECRET")
	AdminName                    = os.Getenv("ADMIN_USERNAME")
	AdminPassword                = os.Getenv("ADMIN_PASSWORD")
	DBUrl                        = os.Getenv("DB_SERVER")
	DBUser                       = os.Getenv("DB_USER")
	DBPassword                   = os.Getenv("DB_PASSWORD")
	JWTExpiryDuration            = getEnvAsInt("JWT_EXPIRY_MINS", 1440)
	OAuthJWTExpDuration          = getEnvAsInt("OAUTH_JWT_EXP_MINS", 5)
	OAuthJwtSecret               = os.Getenv("OAUTH_SECRET")
	StrictPasswordPolicy         = getEnvAsBool("STRICT_PASSWORD_POLICY", false)
	DexEnabled                   = getEnvAsBool("DEX_ENABLED", false)
	DexCallBackURL               = os.Getenv("DEX_OAUTH_CALLBACK_URL")
	DexClientID                  = os.Getenv("DEX_OAUTH_CLIENT_ID")
	DexClientSecret              = os.Getenv("DEX_OAUTH_CLIENT_SECRET")
	DexOIDCIssuer                = os.Getenv("OIDC_ISSUER")
	EnableHTTPSConnection        = os.Getenv("ENABLE_HTTPS_CONNECTION")
	CustomTlsCertPath            = os.Getenv("CUSTOM_TLS_CERT_PATH")
	TlSKeyPath                   = os.Getenv("TLS_KEY_PATH")
	CaCertPath                   = os.Getenv("CA_CERT_PATH")
	DBName                       = "auth"
	Port                         = ":3000"
	PortHttps                    = ":3001"
	GrpcPort                     = ":3030"
	GrpcPortHttps                = ":3031"
	UserCollection               = "users"
	ProjectCollection            = "project"
	RevokedTokenCollection       = "revoked-token"
	ApiTokenCollection           = "api-token"
	UsernameField                = "username"
	ExpiresAtField               = "expires_at"
	PasswordEncryptionCost       = 15
	DefaultLitmusGqlGrpcEndpoint = "localhost"
	DefaultLitmusGqlGrpcPort     = ":8000"
	//DefaultLitmusGqlGrpcPortHttps = ":8001" // enable when in use
)

func getEnvAsInt(name string, defaultVal int) int {
	valueStr := os.Getenv(name)
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultVal
}

func getEnvAsBool(name string, defaultVal bool) bool {
	valueStr := os.Getenv(name)
	if valueStr, err := strconv.ParseBool(valueStr); err == nil {
		return valueStr
	}
	return defaultVal
}

func GetTlsConfig() *tls.Config {

	// read ca's cert, verify to client's certificate
	caPem, err := os.ReadFile(CaCertPath)
	if err != nil {
		log.Fatal(err)
	}

	// create cert pool and append ca's cert
	certPool := x509.NewCertPool()
	if !certPool.AppendCertsFromPEM(caPem) {
		log.Fatal(err)
	}

	// read server cert & key
	serverCert, err := tls.LoadX509KeyPair(CustomTlsCertPath, TlSKeyPath)
	if err != nil {
		log.Fatal(err)
	}

	// configuration of the certificate what we want to
	conf := &tls.Config{
		Certificates: []tls.Certificate{serverCert},
		ClientAuth:   tls.RequireAndVerifyClientCert,
		ClientCAs:    certPool,
	}
	return conf
}
