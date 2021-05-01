package prometheus

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"strconv"
	"strings"
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
func Query(prom analytics.PromQuery, queryType string) (model.PromResponse, error) {
	client, err := CreateClient(prom.URL)
	if err != nil {
		return model.PromResponse{}, err
	}

	startTime, err := strconv.ParseInt(prom.Start, 10, 64)
	if err != nil {
		return model.PromResponse{}, err
	}

	endTime, err := strconv.ParseInt(prom.End, 10, 64)
	if err != nil {
		return model.PromResponse{}, err
	}

	timeRange := apiV1.Range{
		Start: time.Unix(startTime, 0).UTC(),
		End:   time.Unix(endTime, 0).UTC(),
		Step:  time.Duration(int64(prom.Minstep)) * time.Second,
	}

	value, _, err := client.QueryRange(context.TODO(), prom.Query, timeRange)

	if err != nil {
		return model.PromResponse{}, err
	}

	data, ok := value.(md.Matrix)
	if !ok {
		log.Print("Unsupported result format: %s", value.Type().String())
	}

	var (
		newResponse analytics.Response
		newTSVs     [][]*analytics.TimeStampValue
		newLegends  [][]*string
	)

	for _, v := range data {

		var (
			tempTSV     []*analytics.TimeStampValue
			tempLegends []*string
		)

		if queryType == "metrics" {
			for _, value := range v.Values {
				temp := &analytics.TimeStampValue{
					Timestamp: func(str string) *string { return &str }(fmt.Sprint(map[bool]int{true: int(value.Value) * 1000, false: 0}[value.Timestamp >= 0])),
					Value:     func(str string) *string { return &str }(fmt.Sprint(map[bool]float64{true: float64(value.Value), false: 0.0}[value.Value >= 0])),
				}

				tempTSV = append(tempTSV, temp)
			}
		} else {
			for _, value := range v.Values {
				temp := &analytics.TimeStampValue{
					Timestamp: func(str string) *string { return &str }(fmt.Sprint(map[bool]int{true: int(value.Value) * 1000, false: 0}[value.Timestamp >= 0])),
					Value:     func(str string) *string { return &str }(fmt.Sprint(map[bool]int{true: int(value.Value), false: 0}[value.Value >= 0])),
				}

				tempTSV = append(tempTSV, temp)
			}
		}

		newTSVs = append(newTSVs, tempTSV)

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
		newLegends = append(newLegends, tempLegends)
	}
	newResponse.Tsvs = newTSVs
	newResponse.Queryid = prom.Queryid
	newResponse.Legends = newLegends

	var resp model.PromResponse
	if len(newLegends) != 0 && len(newLegends[0]) != 0 {
		err := copier.Copy(&resp, &newResponse)
		if err != nil {
			return model.PromResponse{}, err
		}
	}

	return resp, nil
}

// LabelNamesAndValues is used to query prometheus using client for label names and values of a series
func LabelNamesAndValues(prom analytics.PromSeries) (model.PromSeriesResponse, error) {
	client, err := CreateClient(prom.URL)
	if err != nil {
		return model.PromSeriesResponse{}, err
	}

	startTime, err := strconv.ParseInt(prom.Start, 10, 64)
	if err != nil {
		return model.PromSeriesResponse{}, err
	}

	endTime, err := strconv.ParseInt(prom.End, 10, 64)
	if err != nil {
		return model.PromSeriesResponse{}, err
	}

	start := time.Unix(startTime, 0).UTC()
	end := time.Unix(endTime, 0).UTC()
	matcher := []string{prom.Series}

	labelNames, _, err := client.LabelNames(context.TODO(), matcher, start, end)
	if err != nil {
		return model.PromSeriesResponse{}, err
	}

	var (
		newResponse    analytics.PromSeriesResponse
		newLabelValues []*analytics.LabelValue
	)

	if len(labelNames) >= 1 {
		for _, label := range labelNames {
			var newValues []*string
			values, _, err := client.LabelValues(context.TODO(), label, matcher, start, end)
			if err != nil {
				return model.PromSeriesResponse{}, err
			}

			for _, value := range values {
				newValues = append(newValues, func(str string) *string { return &str }(fmt.Sprint(value)))
			}

			tempLabelValues := &analytics.LabelValue{
				Label:  label,
				Values: newValues,
			}
			newLabelValues = append(newLabelValues, tempLabelValues)
		}
	}

	newResponse.Series = prom.Series
	newResponse.LabelValues = newLabelValues

	var resp model.PromSeriesResponse
	copyError := copier.Copy(&resp, &newResponse)
	if copyError != nil {
		return model.PromSeriesResponse{}, err
	}

	return resp, nil
}
