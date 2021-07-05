package ops

import (
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/patrickmn/go-cache"
)

func CreateDateMap(updatedAt string, filter model.TimeFrequency, statsMap map[string]model.WorkflowStats) error {
	// Converts the time stamp(string) to unix
	i, err := strconv.ParseInt(updatedAt, 10, 64)
	if err != nil {
		return err
	}
	// Converts unix time to time.Time
	lastUpdatedTime := time.Unix(i, 0)

	// Switch case to fill the map according to filter
	switch filter {
	case model.TimeFrequencyMonthly:
		key := int(lastUpdatedTime.Month())
		month := statsMap[string(key)]

		// Incrementing the value for each month
		month.Value++
		statsMap[string(key)] = month

	case model.TimeFrequencyDaily:
		key := fmt.Sprintf("%d-%d", lastUpdatedTime.Month(), lastUpdatedTime.Day())
		day := statsMap[key]

		// Incrementing the value for each day
		day.Value++
		statsMap[key] = day

	case model.TimeFrequencyHourly:
		key := fmt.Sprintf("%d-%d", lastUpdatedTime.Day(), lastUpdatedTime.Hour())
		hour := statsMap[key]

		// Incrementing the value for each hour
		hour.Value++
		statsMap[key] = hour

	default:
		return errors.New("no matching filter found")
	}
	return nil
}

func PatchChaosEventWithVerdict(annotations []*model.AnnotationsPromResponse, verdictResponse *model.AnnotationsPromResponse, promInput *model.PromInput, AnalyticsCache *cache.Cache) []*model.AnnotationsPromResponse {
	var existingAnnotations []*model.AnnotationsPromResponse
	err := copier.Copy(&existingAnnotations, &annotations)
	if err != nil {
		log.Printf("Error parsing existing annotations  %v\n", err)
	}

	for annotationIndex, annotation := range existingAnnotations {
		var existingAnnotation model.AnnotationsPromResponse
		err := copier.Copy(&existingAnnotation, &annotation)
		if err != nil {
			log.Printf("Error parsing existing annotation  %v\n", err)
		}

		if strings.Contains(existingAnnotation.Queryid, "chaos-event") {
			var newAnnotation model.AnnotationsPromResponse
			err := copier.Copy(&newAnnotation, &verdictResponse)
			if err != nil {
				log.Printf("Error parsing new annotation  %v\n", err)
			}

			for verdictLegendIndex, verdictLegend := range newAnnotation.Legends {
				verdictLegendName := func(str *string) string { return *str }(verdictLegend)
				var eventFound = false

				for eventLegendIndex, eventLegend := range existingAnnotation.Legends {
					eventLegendName := func(str *string) string { return *str }(eventLegend)

					if verdictLegendName == eventLegendName {
						eventFound = true
						var newVerdictSubData []*model.SubData

						for _, verdictSubData := range verdictResponse.SubDataArray[verdictLegendIndex] {
							verdictSubDataDate := func(date *float64) float64 { return *date }(verdictSubData.Date)
							var subDataFound = false
							for eventSubDataIndex, eventSubData := range annotation.SubDataArray[eventLegendIndex] {
								if eventSubData != nil {
									eventSubDataDate := func(date *float64) float64 { return *date }(eventSubData.Date)
									if eventSubData.SubDataName == verdictSubData.SubDataName && eventSubDataDate == verdictSubDataDate {
										subDataFound = true
										annotations[annotationIndex].SubDataArray[eventLegendIndex][eventSubDataIndex].Value = verdictSubData.Value
									}
								}
							}

							if !subDataFound && verdictSubDataDate > 0 {
								newVerdictSubData = append(newVerdictSubData, verdictSubData)
							}
						}
						annotations[annotationIndex].SubDataArray[eventLegendIndex] = append(annotations[annotationIndex].SubDataArray[eventLegendIndex], newVerdictSubData...)
					}
				}

				if !eventFound {
					verdictValid := false
					for _, tsv := range verdictResponse.Tsvs[verdictLegendIndex] {
						if !verdictValid && func(val *int) int { return *val }(tsv.Value) == 1 {
							verdictValid = true
						}
					}

					if verdictValid {
						annotations[annotationIndex].Legends = append(annotations[annotationIndex].Legends, verdictLegend)
						annotations[annotationIndex].SubDataArray = append(annotations[annotationIndex].SubDataArray, verdictResponse.SubDataArray[verdictLegendIndex])
						annotations[annotationIndex].Tsvs = append(annotations[annotationIndex].Tsvs, nil)
					}
				}
			}

			eventCacheKey := annotation.Queryid + "-" + promInput.DsDetails.Start + "-" + promInput.DsDetails.End + "-" + promInput.DsDetails.URL
			cacheError := utils.AddCache(AnalyticsCache, eventCacheKey, annotations[annotationIndex])
			if cacheError != nil {
				errorStr := fmt.Sprintf("%v", cacheError)
				if strings.Contains(errorStr, "already exists") {
					cacheError = utils.UpdateCache(AnalyticsCache, eventCacheKey, annotations[annotationIndex])
					if cacheError != nil {
						log.Printf("Error while caching: %v\n", cacheError)
					}
				}
			}
		}
	}

	return annotations
}

func MapMetricsToDashboard(dashboardQueryMap []*model.QueryMapForPanelGroup, newPromResponse *model.PromResponse, queryResponseMap map[string]*model.MetricsPromResponse) *model.DashboardPromResponse {
	var dashboardMetrics []*model.MetricDataForPanelGroup

	for _, panelGroupQueryMap := range dashboardQueryMap {
		var panelGroupMetrics []*model.MetricDataForPanel
		for _, panelQueryMap := range panelGroupQueryMap.PanelQueryMap {
			var panelQueries []*model.MetricsPromResponse
			for _, queryID := range panelQueryMap.QueryIDs {
				panelQueries = append(panelQueries, queryResponseMap[queryID])
			}
			panelMetricsData := &model.MetricDataForPanel{
				PanelID:              panelQueryMap.PanelID,
				PanelMetricsResponse: panelQueries,
			}
			panelGroupMetrics = append(panelGroupMetrics, panelMetricsData)
		}
		panelGroupMetricsData := &model.MetricDataForPanelGroup{
			PanelGroupID:              panelGroupQueryMap.PanelGroupID,
			PanelGroupMetricsResponse: panelGroupMetrics,
		}
		dashboardMetrics = append(dashboardMetrics, panelGroupMetricsData)
	}

	var promResponse model.PromResponse
	err := copier.Copy(&promResponse, &newPromResponse)
	if err != nil {
		log.Printf("Error parsing annotations  %v\n", err)
	}
	dashboardResponse := &model.DashboardPromResponse{
		DashboardMetricsResponse: dashboardMetrics,
		AnnotationsResponse:      promResponse.AnnotationsResponse,
	}

	return dashboardResponse
}
