package events

import (
	"strconv"
	"subscriber/pkg/graphql"
	"subscriber/pkg/k8s"
	"subscriber/pkg/types"
	"testing"

	"github.com/stretchr/testify/assert"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
)

func FuzzGenerateWorkflowPayload(f *testing.F) {
	subscriberGraphql := graphql.NewSubscriberGql()
	subscriberK8s := k8s.NewK8sSubscriber(subscriberGraphql)
	subscriberEvents := NewSubscriberEventsOperator(subscriberGraphql, subscriberK8s)

	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)

		targetStruct := &struct {
			Cid, AccessKey, Version, Completed string
			WfEvent                            types.WorkflowEvent
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		_, _ = subscriberEvents.GenerateWorkflowPayload(targetStruct.Cid, targetStruct.AccessKey, targetStruct.Version, targetStruct.Completed, targetStruct.WfEvent)
	})
}

func FuzzStrConvTime(f *testing.F) {
	f.Add(int64(12345))
	f.Add(int64(54353))
	f.Add(int64(-12345))

	f.Fuzz(func(t *testing.T, data int64) {
		resp := StrConvTime(data)
		if data < 0 {
			assert.Empty(t, resp)
		} else {
			assert.Equal(t, strconv.FormatInt(data, 10), resp)
		}
	})
}

func FuzzGetExperimentStatus(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)

		targetStruct := &struct {
			WfEvent types.WorkflowEvent
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		_, err = getExperimentStatus(targetStruct.WfEvent)
		if targetStruct.WfEvent.Phase == "" {
			assert.EqualError(t, err, "status is invalid")
		} else {
			assert.NoError(t, err)
		}
	})
}
