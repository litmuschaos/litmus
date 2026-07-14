package utils

import (
	"crypto/tls"
	"crypto/x509"
	"os"

	log "github.com/sirupsen/logrus"
)

func GetTlsConfig(certPath string, keyPath string, isServerConfig bool) *tls.Config {

	// read ca's cert, verify to client's certificate
	caPem, err := os.ReadFile(Config.CaCertTlsPath)
	if err != nil {
		log.Fatal(err)
	}

	// create cert pool and append ca's cert
	certPool := x509.NewCertPool()
	if !certPool.AppendCertsFromPEM(caPem) {
		log.Fatal(err)
	}

	// read server cert & key
	cert, err := tls.LoadX509KeyPair(certPath, keyPath)
	if err != nil {
		log.Fatal(err)
	}

	config := &tls.Config{
		Certificates: []tls.Certificate{cert},
		RootCAs:      certPool,
	}

	if isServerConfig {
		// configuring TLS config based on provided certificates & keys to
		conf := &tls.Config{
			Certificates: []tls.Certificate{cert},
			ClientAuth:   tls.RequireAndVerifyClientCert,
			ClientCAs:    certPool,
		}
		return conf
	}

	return config
}
