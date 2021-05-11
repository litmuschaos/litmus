package prometheus

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/jinzhu/copier"
	"github.com/prometheus/client_golang/api"
	apiV1 "github.com/prometheus/client_golang/api/prometheus/v1"
	md "github.com/prometheus/common/model"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics"
)

// CreateClient creates a prometheus client from a URL
func CreateClient(url string) (apiV1.API, error) {
	var DefaultRT = api.DefaultRoundTripper

	cfg := api.Config{
		Address:      url,
		RoundTripper: DefaultRT,
	}

	client, err := api.NewClient(cfg)
	if err != nil {
		return nil, err
	}

	return apiV1.NewAPI(client), nil
}

// Query is used to query prometheus using client
func Query(prom analytics.PromQuery, queryType string) (interface{}, error) {
	client, err := CreateClient(prom.URL)

	if err != nil {
		return nil, err
	}

	startTime, err := strconv.ParseInt(prom.Start, 10, 64)
	if err != nil {
		return nil, err
	}

	endTime, err := strconv.ParseInt(prom.End, 10, 64)
	if err != nil {
		return nil, err
	}

	timeRange := apiV1.Range{
		Start: time.Unix(startTime, 0).UTC(),
		End:   time.Unix(endTime, 0).UTC(),
		Step:  time.Duration(int64(prom.Minstep)) * time.Second,
	}

	value, _, err := client.QueryRange(context.TODO(), prom.Query, timeRange)

	if err != nil {
		return nil, err
	}

	data, ok := value.(md.Matrix)
	if !ok {
		log.Print("Unsupported result format: %s", value.Type().String())
	}

	var (
		newMetrics         analytics.MetricsResponse
		newAnnotations     analytics.AnnotationsResponse
		newMetricsTSVs     [][]*analytics.MetricsTimeStampValue
		newAnnotationsTSVs [][]*analytics.AnnotationsTimeStampValue
		newLegends         []*string
	)

	for _, v := range data {

		var (
			tempMetricsTSV     []*analytics.MetricsTimeStampValue
			tempAnnotationsTSV []*analytics.AnnotationsTimeStampValue
			tempLegends        []*string
		)

		if queryType == "metrics" {
			for _, value := range v.Values {
				temp := &analytics.MetricsTimeStampValue{
					Date:  func(timestamp float64) *float64 { return &timestamp }(map[bool]float64{true: float64(value.Timestamp), false: 0}[float64(value.Timestamp) >= 0.0]),
					Value: func(val float64) *float64 { return &val }(map[bool]float64{true: float64(value.Value), false: 0.0}[float64(value.Value) >= 0.0]),
				}

				tempMetricsTSV = append(tempMetricsTSV, temp)
			}
			newMetricsTSVs = append(newMetricsTSVs, tempMetricsTSV)
		} else {
			for _, value := range v.Values {
				temp := &analytics.AnnotationsTimeStampValue{
					Date:  func(timestamp float64) *float64 { return &timestamp }(map[bool]float64{true: float64(value.Timestamp), false: 0}[float64(value.Timestamp) >= 0.0]),
					Value: func(val int) *int { return &val }(map[bool]int{true: int(value.Value), false: 0}[int(value.Value) >= 0]),
				}

				tempAnnotationsTSV = append(tempAnnotationsTSV, temp)
			}
			newAnnotationsTSVs = append(newAnnotationsTSVs, tempAnnotationsTSV)
		}

		if prom.Legend == nil || *prom.Legend == "" {
			tempLegends = append(tempLegends, func(str string) *string { return &str }(fmt.Sprint(v.Metric.String())))
		} else {
			r, _ := regexp.Compile(`\{{(.*?)\}}`)
			elements := r.FindAllString(*prom.Legend, -1)

			var filterResponse = *prom.Legend
			for _, element := range elements {
				tmpElement := element
				tmpElement = strings.Trim(tmpElement, "{")
				tmpElement = strings.Trim(tmpElement, "}")
				if element != "" {
					value := func(str string) string { return str }(fmt.Sprint(v.Metric[md.LabelName(tmpElement)]))
					if value == "" {
						filterResponse = strings.Replace(filterResponse, element, tmpElement, -1)
					}
					filterResponse = strings.Replace(filterResponse, element, value, -1)
				}
			}

			tempLegends = append(tempLegends, func(str string) *string { return &str }(fmt.Sprint(filterResponse)))
		}
		newLegends = append(newLegends, tempLegends...)
	}

	if queryType == "metrics" {
		newMetrics.Tsvs = newMetricsTSVs
		newMetrics.Queryid = prom.Queryid
		newMetrics.Legends = newLegends

		var resp model.MetricsPromResponse
		if len(newLegends) != 0 {
			err := copier.Copy(&resp, &newMetrics)
			if err != nil {
				return &model.MetricsPromResponse{}, err
			}
		}

		return &resp, nil

	} else {
		newAnnotations.Tsvs = newAnnotationsTSVs
		newAnnotations.Queryid = prom.Queryid
		newAnnotations.Legends = newLegends

		var resp model.AnnotationsPromResponse
		if len(newLegends) != 0 {
			err := copier.Copy(&resp, &newAnnotations)
			if err != nil {
				return &model.AnnotationsPromResponse{}, err
			}
		}

		return &resp, nil
	}

}

// LabelNamesAndValues is used to query prometheus using client for label names and values of a series
func LabelNamesAndValues(prom analytics.PromSeries) (*model.PromSeriesResponse, error) {
	client, err := CreateClient(prom.URL)
	if err != nil {
		return &model.PromSeriesResponse{}, err
	}

	startTime, err := strconv.ParseInt(prom.Start, 10, 64)
	if err != nil {
		return &model.PromSeriesResponse{}, err
	}

	endTime, err := strconv.ParseInt(prom.End, 10, 64)
	if err != nil {
		return &model.PromSeriesResponse{}, err
	}

	start := time.Unix(startTime, 0).UTC()
	end := time.Unix(endTime, 0).UTC()
	matcher := []string{prom.Series}

	labelNames, _, err := client.LabelNames(context.TODO(), matcher, start, end)
	if err != nil {
		return &model.PromSeriesResponse{}, err
	}

	var (
		newResponse    analytics.PromSeriesResponse
		newLabelValues []*analytics.LabelValue
	)

	if len(labelNames) >= 1 {
		var wg sync.WaitGroup
		wg.Add(len(labelNames) - 1)
		for index, label := range labelNames {
			if index != 0 {
				go func(index int, label string) {
					defer wg.Done()
					var newValues []*string
					values, _, err := client.LabelValues(context.TODO(), label, matcher, start, end)
					if err != nil {
						return
					}

					for _, value := range values {
						newValues = append(newValues, func(str string) *string { return &str }(fmt.Sprint(value)))
					}

					tempLabelValues := &analytics.LabelValue{
						Label:  label,
						Values: newValues,
					}
					newLabelValues = append(newLabelValues, tempLabelValues)

				}(index, label)
			}
		}
		wg.Wait()

		newResponse.Series = prom.Series
		newResponse.LabelValues = newLabelValues
	}
	var resp model.PromSeriesResponse
	copyError := copier.Copy(&resp, &newResponse)
	if copyError != nil {
		return &model.PromSeriesResponse{}, err
	}

	return &resp, nil
}

// SeriesList is used to query prometheus using client for names of time series
func SeriesList(prom analytics.PromDSDetails) (*model.PromSeriesListResponse, error) {
	client, err := CreateClient(prom.URL)
	if err != nil {
		return &model.PromSeriesListResponse{}, err
	}

	startTime, err := strconv.ParseInt(prom.Start, 10, 64)
	if err != nil {
		return &model.PromSeriesListResponse{}, err
	}

	endTime, err := strconv.ParseInt(prom.End, 10, 64)
	if err != nil {
		return &model.PromSeriesListResponse{}, err
	}

	start := time.Unix(startTime, 0).UTC()
	end := time.Unix(endTime, 0).UTC()

	var (
		matcher     []string
		newValues   []*string
		newResponse analytics.PromSeriesListResponse
	)

	labelValues, _, err := client.LabelValues(context.TODO(), "__name__", matcher, start, end)
	if err != nil {
		return &model.PromSeriesListResponse{}, err
	}

	for _, labelValue := range labelValues {
		newValues = append(newValues, func(str string) *string { return &str }(fmt.Sprint(labelValue)))
	}

	newResponse.SeriesList = newValues

	var resp model.PromSeriesListResponse
	copyError := copier.Copy(&resp, &newResponse)
	if copyError != nil {
		return &model.PromSeriesListResponse{}, err
	}

	return &resp, nil
}
