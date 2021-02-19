package prometheus

import (
	"bytes"
	"log"
	"net/http"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics"
)

const (
	ACTIVE    analytics.STATE = "ACTIVE"
	NOT_READY analytics.STATE = "NOT READY"
	INACTIVE  analytics.STATE = "INACTIVE"
)

func TSDBHealthCheck(url, datasourceType string) string {
	dbHealth := "Inactive"
	dbPingState, dbServerMsg := pingCheck(url)

	if dbPingState == "ACTIVE" {
		dbHealth = "Active"
	}

	log.Printf(dbServerMsg)

	if datasourceType == "Prometheus" {
		prometheusHealth, prometheusHealthMsg := prometheusHealthCheck(url)
		prometheusReadiness, prometheusReadinessMsg := prometheusReadinessCheck(url)

		log.Printf(prometheusHealthMsg)
		log.Printf(prometheusReadinessMsg)

		if dbHealth == "Active" && (prometheusHealth != "ACTIVE" || prometheusReadiness != "ACTIVE") {
			dbHealth = "Not Ready"
		}
	}

	return dbHealth
}

func pingCheck(url string) (analytics.STATE, string) {
	client := http.Client{}
	resp, err := client.Get(url)

	if err != nil {
		return INACTIVE, err.Error()
	}

	if resp.StatusCode == 200 {
		return ACTIVE, "Server Up [200 OK]"
	}

	return NOT_READY, "Server reachable but returned [" + resp.Status + "]"
}

func prometheusHealthCheck(url string) (analytics.STATE, string) {
	client := http.Client{}
	resp, err := client.Get(url + "/-/healthy")

	if err != nil {
		return INACTIVE, err.Error()
	}

	buffer := new(bytes.Buffer)
	_, _ = buffer.ReadFrom(resp.Body)
	bodyString := buffer.String()

	if resp.StatusCode == 200 && bodyString == "Prometheus is Healthy.\n" {
		return ACTIVE, "Prometheus is Healthy."
	}

	return NOT_READY, "Server reachable but returned [" + bodyString + "]"
}

func prometheusReadinessCheck(url string) (analytics.STATE, string) {
	client := http.Client{}
	resp, err := client.Get(url + "/-/ready")

	if err != nil {
		return INACTIVE, err.Error()
	}

	buffer := new(bytes.Buffer)
	_, _ = buffer.ReadFrom(resp.Body)
	bodyString := buffer.String()

	if resp.StatusCode == 200 && bodyString == "Prometheus is Ready.\n" {
		return ACTIVE, "Prometheus is Ready."
	}

	return NOT_READY, "Server reachable but returned [" + bodyString + "]"
}
