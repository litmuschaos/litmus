package ops

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
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
