package utils

import (
	"encoding/json"
	"testing"

	litmuschaosv1 "github.com/litmuschaos/litmus/chaoscenter/event-tracker/api/v1"
	appsv1 "k8s.io/api/apps/v1"
)

func TestCases_OrderingOperators(t *testing.T) {
	tests := []struct {
		name     string
		key      string
		value    string
		operator string
		want     bool
	}{
		{name: "10 is greater than 5", key: "10", value: "5", operator: "GreaterThan", want: true},
		{name: "5 is not greater than 10", key: "5", value: "10", operator: "GreaterThan", want: false},
		{name: "9 is less than 10", key: "9", value: "10", operator: "LessThan", want: true},
		{name: "10 is not less than 9", key: "10", value: "9", operator: "LessThan", want: false},
		{name: "100 is greater than or equal to 99", key: "100", value: "99", operator: "GreaterThanEqualTo", want: true},
		{name: "99 is not greater than or equal to 100", key: "99", value: "100", operator: "GreaterThanEqualTo", want: false},
		{name: "99 is less than or equal to 100", key: "99", value: "100", operator: "LessThanEqualTo", want: true},
		{name: "100 is not less than or equal to 99", key: "100", value: "99", operator: "LessThanEqualTo", want: false},
		{name: "equal numbers satisfy GreaterThanEqualTo", key: "5", value: "5", operator: "GreaterThanEqualTo", want: true},
		{name: "equal numbers satisfy LessThanEqualTo", key: "5", value: "5", operator: "LessThanEqualTo", want: true},
		{name: "equal numbers are not GreaterThan", key: "5", value: "5", operator: "GreaterThan", want: false},
		{name: "equal numbers are not LessThan", key: "5", value: "5", operator: "LessThan", want: false},
		{name: "decimal is less than a larger integer", key: "2.5", value: "10", operator: "LessThan", want: true},
		{name: "negative number is less than zero", key: "-3", value: "0", operator: "LessThan", want: true},
		{name: "exponent notation printed for large floats", key: "1e+06", value: "999999", operator: "GreaterThan", want: true},
		// Values that are not numbers keep being compared as strings.
		{name: "image tags are compared as strings", key: "nginx:1.18", value: "nginx:1.21", operator: "LessThan", want: true},
		{name: "a number and a word are compared as strings", key: "10", value: "abc", operator: "LessThan", want: true},
		// Equality operators are untouched.
		{name: "EqualTo matches identical strings", key: "5", value: "5", operator: "EqualTo", want: true},
		{name: "NotEqualTo matches different strings", key: "5", value: "6", operator: "NotEqualTo", want: true},
		{name: "unknown operator never matches", key: "5", value: "5", operator: "Bogus", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := cases(tt.key, tt.value, tt.operator); got != tt.want {
				t.Errorf("cases(%q, %q, %q) = %v, want %v", tt.key, tt.value, tt.operator, got, tt.want)
			}
		})
	}
}

// deploymentAsData turns a Deployment into generic JSON data, the same way
// PolicyAuditor does before it evaluates a policy (so numbers become float64).
func deploymentAsData(t *testing.T, replicas int32) interface{} {
	t.Helper()

	raw, err := json.Marshal(appsv1.Deployment{Spec: appsv1.DeploymentSpec{Replicas: &replicas}})
	if err != nil {
		t.Fatal(err)
	}
	var data interface{}
	if err := json.Unmarshal(raw, &data); err != nil {
		t.Fatal(err)
	}

	return data
}

// A policy such as "spec.replicas GreaterThan 5" must fire when a Deployment
// is scaled from 3 to 10 replicas, for both condition types.
func TestConditionChecker_NumericGreaterThan(t *testing.T) {
	threshold := "5"
	oldData := deploymentAsData(t, 3)
	newData := deploymentAsData(t, 10)

	for _, conditionType := range []string{"and", "or"} {
		t.Run(conditionType, func(t *testing.T) {
			policy := litmuschaosv1.EventTrackerPolicy{
				Spec: litmuschaosv1.EventTrackerPolicySpec{
					ConditionType: conditionType,
					Conditions: []litmuschaosv1.Condition{
						{Key: "spec.replicas", Value: &threshold, Operator: "GreaterThan"},
					},
				},
			}

			if !conditionChecker(policy, newData, oldData) {
				t.Errorf("expected %q policy to match when spec.replicas goes from 3 to 10 (GreaterThan 5)", conditionType)
			}
		})
	}
}
