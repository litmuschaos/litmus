package handler

import (
	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"testing"
)

func FuzzGetChartsPath(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)

		chartsInput := model.CloningInput{}
		err := fuzzConsumer.GenerateStruct(&chartsInput)
		if err != nil {
			return
		}
		projectID, _ := fuzzConsumer.GetString()
		isDefault, _ := fuzzConsumer.GetBool()

		result := GetChartsPath(chartsInput, projectID, isDefault)

		if isDefault {
			expected := DefaultPath + "default/" + chartsInput.Name + "/faults/"
			if result != expected {
				t.Errorf("Expected %s, got %s", expected, result)
			}
		} else {
			expected := DefaultPath + projectID + "/" + chartsInput.Name + "/faults/"
			if result != expected {
				t.Errorf("Expected %s, got %s", expected, result)
			}
		}
	})
}
