package events

import (
	"fmt"
	"subscriber/pkg/graphql"
	"subscriber/pkg/k8s"
	"subscriber/pkg/types"
	"testing"

	"github.com/stretchr/testify/assert"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/golang/mock/gomock"
)

func FuzzGenerateWorkflowPayload(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)

		targetStruct := &struct {
			cid, accessKey, version, completed string
			wfEvent                            types.WorkflowEvent
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		subscriberGraphql := graphql.NewSubscriberGql()
		subscriberK8s := k8s.NewK8sSubscriber(subscriberGraphql)
		subscriberEvents := NewSubscriberEventsOperator(subscriberGraphql, subscriberK8s)

		event, err := subscriberEvents.GenerateWorkflowPayload(targetStruct.cid, targetStruct.accessKey, targetStruct.version, targetStruct.completed, targetStruct.wfEvent)
		if err != nil {
			fmt.Println(event)
			t.Errorf("Unexpected error: %v", err)
		}
		if event == nil {
			t.Errorf("Returned payload is nil")
		}
	})
}

func FuzzStrConvTime(f *testing.F) {

	targetStruct := []int64{
		12345, 54353, -12345,
	}

	for _, v := range targetStruct {
		f.Add(v)
	}

	f.Fuzz(func(t *testing.T, data int64) {

		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		resp := StrConvTime(data)
		if resp == "" {
			t.Log("result is in negative")
		} else {
			t.Log("converted successfully")
		}
	})
}

func FuzzGetExperimentStatus(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)

		targetStruct := &struct {
			wfEvent types.WorkflowEvent
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		fmt.Println(targetStruct.wfEvent)
		// Call the getExperimentStatus function
		_, err = getExperimentStatus(targetStruct.wfEvent)
		if err != nil {
			assert.Equal(t, "status is invalid", "status is invalid")
		} else {
			t.Log("status returned")
		}
	})
}
