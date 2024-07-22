package graph

import (
	"github.com/prometheus/client_golang/prometheus"
)

// Define a struct for you collector that contains pointers
// to prometheus descriptors for each metric you wish to expose.
// Note you can also include fields of other types if they provide utility
// but we just won't be exposing them as metrics.

type Infra struct {
	Name      string
	InfraNamespace string
  isActive bool
  PlatformName string
}

type infraCollector struct {
	infraMetric *prometheus.Desc
	AllInfras   func() []Infra
}

type InfraProvider func() []Infra

// You must create a constructor for you collector that
// initializes every desinfrasProvidercriptor and returns a pointer to the collector
func newInfraCollector(fn InfraProvider) *infraCollector {
	return &infraCollector{
		infraMetric: prometheus.NewDesc("infra_metric", "Shows chaos infra status and info", []string{"name", "namespace"}, nil),
		AllInfras: fn, 
	}
}

func (collector *infraCollector) Describe(ch chan<- *prometheus.Desc) {
	ch <- collector.infraMetric
}

func (collector *infraCollector) Collect(ch chan<- prometheus.Metric) {
	for _, infra := range collector.AllInfras() {
    var metricValue float64 = 0
    if infra.isActive {
      metricValue = 1
    }
		ch <- prometheus.MustNewConstMetric(collector.infraMetric, prometheus.GaugeValue, metricValue, infra.Name, infra.InfraNamespace)
	}
}
