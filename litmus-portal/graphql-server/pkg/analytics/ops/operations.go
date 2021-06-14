package ops

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
)

// FirstDayOfISOWeek returns first day of the given ISO week
func FirstDayOfISOWeek(year int, week int, timezone *time.Location) time.Time {
	date := time.Date(year, 0, 0, 0, 0, 0, 0, timezone)
	isoYear, isoWeek := date.ISOWeek()
	for date.Weekday() != time.Monday { // iterate back to Monday
		date = date.AddDate(0, 0, -1)
		isoYear, isoWeek = date.ISOWeek()
	}
	for isoYear < year { // iterate forward to the first day of the first week
		date = date.AddDate(0, 0, 1)
		isoYear, isoWeek = date.ISOWeek()
	}
	for isoWeek < week { // iterate forward to the first day of the given week
		date = date.AddDate(0, 0, 1)
		isoYear, isoWeek = date.ISOWeek()
	}
	return date
}

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

	case model.TimeFrequencyWeekly:
		_, key := lastUpdatedTime.ISOWeek()
		week := statsMap[string(key)]

		// Incrementing the value for each ISO week
		week.Value++
		statsMap[string(key)] = week

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
