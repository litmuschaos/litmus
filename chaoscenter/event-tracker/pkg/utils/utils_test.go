package utils

import (
	"testing"

	litmuschaosv1 "github.com/litmuschaos/litmus/chaoscenter/event-tracker/api/v1"
)

func stringPtr(s string) *string {
	return &s
}

func TestConditionChecker(t *testing.T) {
	tests := []struct {
		name     string
		policy   litmuschaosv1.EventTrackerPolicy
		oldData  interface{}
		newData  interface{}
		expected bool
	}{
		{
			name: "1. Issue #3930 Reproduction - AND with 1 changed condition and 1 unchanged unsatisfied condition",
			policy: litmuschaosv1.EventTrackerPolicy{
				Spec: litmuschaosv1.EventTrackerPolicySpec{
					ConditionType: "and",
					Conditions: []litmuschaosv1.Condition{
						{
							Key:      "spec.replicas",
							Value:    stringPtr("3"),
							Operator: "EqualTo",
						},
						{
							Key:      "spec.template.spec.containers[0].image",
							Value:    stringPtr("nginx:1.21.1"),
							Operator: "EqualTo",
						},
					},
				},
			},
			oldData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 1,
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.18"},
							},
						},
					},
				},
			},
			newData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 3,
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.18"},
							},
						},
					},
				},
			},
			expected: false,
		},
		{
			name: "2. Happy Path - AND with 1 changed condition and 1 already satisfied condition",
			policy: litmuschaosv1.EventTrackerPolicy{
				Spec: litmuschaosv1.EventTrackerPolicySpec{
					ConditionType: "and",
					Conditions: []litmuschaosv1.Condition{
						{
							Key:      "spec.replicas",
							Value:    stringPtr("3"),
							Operator: "EqualTo",
						},
						{
							Key:      "spec.template.spec.containers[0].image",
							Value:    stringPtr("nginx:1.21.1"),
							Operator: "EqualTo",
						},
					},
				},
			},
			oldData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 1,
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.21.1"},
							},
						},
					},
				},
			},
			newData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 3,
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.21.1"},
							},
						},
					},
				},
			},
			expected: true,
		},
		{
			name: "3. Unsatisfied Condition - AND where a condition is unsatisfied on newData",
			policy: litmuschaosv1.EventTrackerPolicy{
				Spec: litmuschaosv1.EventTrackerPolicySpec{
					ConditionType: "and",
					Conditions: []litmuschaosv1.Condition{
						{
							Key:      "spec.replicas",
							Value:    stringPtr("5"),
							Operator: "EqualTo",
						},
					},
				},
			},
			oldData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 1,
				},
			},
			newData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 3,
				},
			},
			expected: false,
		},
		{
			name: "4. Mixed Change Operator Failure - AND with Change condition unchanged and value condition satisfied",
			policy: litmuschaosv1.EventTrackerPolicy{
				Spec: litmuschaosv1.EventTrackerPolicySpec{
					ConditionType: "and",
					Conditions: []litmuschaosv1.Condition{
						{
							Key:      "spec.replicas",
							Operator: "Change",
						},
						{
							Key:      "spec.template.spec.containers[0].image",
							Value:    stringPtr("nginx:1.21.1"),
							Operator: "EqualTo",
						},
					},
				},
			},
			oldData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 3,
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.18"},
							},
						},
					},
				},
			},
			newData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 3, // unchanged
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.21.1"},
							},
						},
					},
				},
			},
			expected: false,
		},
		{
			name: "5. Mixed Change Operator Success - AND with Change condition changed and value condition satisfied",
			policy: litmuschaosv1.EventTrackerPolicy{
				Spec: litmuschaosv1.EventTrackerPolicySpec{
					ConditionType: "and",
					Conditions: []litmuschaosv1.Condition{
						{
							Key:      "spec.replicas",
							Operator: "Change",
						},
						{
							Key:      "spec.template.spec.containers[0].image",
							Value:    stringPtr("nginx:1.21.1"),
							Operator: "EqualTo",
						},
					},
				},
			},
			oldData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 1,
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.21.1"},
							},
						},
					},
				},
			},
			newData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 3, // changed
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.21.1"},
							},
						},
					},
				},
			},
			expected: true,
		},
		{
			name: "6. Existing OR Behavior Lock - OR with 1 changed and matching condition",
			policy: litmuschaosv1.EventTrackerPolicy{
				Spec: litmuschaosv1.EventTrackerPolicySpec{
					ConditionType: "or",
					Conditions: []litmuschaosv1.Condition{
						{
							Key:      "spec.replicas",
							Value:    stringPtr("3"),
							Operator: "EqualTo",
						},
						{
							Key:      "spec.template.spec.containers[0].image",
							Value:    stringPtr("nginx:1.21.1"),
							Operator: "EqualTo",
						},
					},
				},
			},
			oldData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 1,
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.18"},
							},
						},
					},
				},
			},
			newData: map[string]interface{}{
				"spec": map[string]interface{}{
					"replicas": 3, // matches
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.18"},
							},
						},
					},
				},
			},
			expected: true,
		},
		{
			name: "7. Empty Conditions List - Should return false safely",
			policy: litmuschaosv1.EventTrackerPolicy{
				Spec: litmuschaosv1.EventTrackerPolicySpec{
					ConditionType: "and",
					Conditions:    []litmuschaosv1.Condition{},
				},
			},
			oldData:  map[string]interface{}{"spec": map[string]interface{}{"replicas": 1}},
			newData:  map[string]interface{}{"spec": map[string]interface{}{"replicas": 3}},
			expected: false,
		},
		{
			name: "8. Nil Value Safety - Condition with nil Value pointer does not panic and returns false",
			policy: litmuschaosv1.EventTrackerPolicy{
				Spec: litmuschaosv1.EventTrackerPolicySpec{
					ConditionType: "and",
					Conditions: []litmuschaosv1.Condition{
						{
							Key:      "spec.replicas",
							Value:    nil, // nil pointer
							Operator: "EqualTo",
						},
					},
				},
			},
			oldData:  map[string]interface{}{"spec": map[string]interface{}{"replicas": 1}},
			newData:  map[string]interface{}{"spec": map[string]interface{}{"replicas": 3}},
			expected: false,
		},
		{
			name: "9. Steady-State Satisfied (Option B) - All conditions satisfied on newData, unrelated field updated",
			// Documents intended AND semantics per official docs ("triggered if both
			// conditions are met"): evaluation is against current state, so an
			// unrelated update while the policy is fully satisfied triggers.
			policy: litmuschaosv1.EventTrackerPolicy{
				Spec: litmuschaosv1.EventTrackerPolicySpec{
					ConditionType: "and",
					Conditions: []litmuschaosv1.Condition{
						{
							Key:      "spec.replicas",
							Value:    stringPtr("3"),
							Operator: "EqualTo",
						},
						{
							Key:      "spec.template.spec.containers[0].image",
							Value:    stringPtr("nginx:1.21.1"),
							Operator: "EqualTo",
						},
					},
				},
			},
			oldData: map[string]interface{}{
				"metadata": map[string]interface{}{"annotations": map[string]interface{}{"foo": "bar1"}},
				"spec": map[string]interface{}{
					"replicas": 3,
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.21.1"},
							},
						},
					},
				},
			},
			newData: map[string]interface{}{
				"metadata": map[string]interface{}{"annotations": map[string]interface{}{"foo": "bar2"}}, // unrelated update
				"spec": map[string]interface{}{
					"replicas": 3,
					"template": map[string]interface{}{
						"spec": map[string]interface{}{
							"containers": []interface{}{
								map[string]interface{}{"image": "nginx:1.21.1"},
							},
						},
					},
				},
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := conditionChecker(tt.policy, tt.newData, tt.oldData)
			if got != tt.expected {
				t.Errorf("conditionChecker() = %v, expected %v", got, tt.expected)
			}
		})
	}
}
