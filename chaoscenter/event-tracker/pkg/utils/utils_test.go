package utils

import (
	"testing"

	litmuschaosv1 "github.com/litmuschaos/litmus/chaoscenter/event-tracker/api/v1"
)

// ── cases() ──────────────────────────────────────────────────────────────────

func TestCases_EqualTo(t *testing.T) {
	if !cases("foo", "foo", "EqualTo") {
		t.Error("EqualTo: expected true for equal strings")
	}
	if cases("foo", "bar", "EqualTo") {
		t.Error("EqualTo: expected false for different strings")
	}
}

func TestCases_NotEqualTo(t *testing.T) {
	if !cases("foo", "bar", "NotEqualTo") {
		t.Error("NotEqualTo: expected true for different strings")
	}
	if cases("foo", "foo", "NotEqualTo") {
		t.Error("NotEqualTo: expected false for equal strings")
	}
}

func TestCases_LessThan(t *testing.T) {
	if !cases("1", "2", "LessThan") {
		t.Error("LessThan: expected true when key < value")
	}
	if cases("2", "1", "LessThan") {
		t.Error("LessThan: expected false when key > value")
	}
	if cases("1", "1", "LessThan") {
		t.Error("LessThan: expected false when key == value")
	}
}

func TestCases_GreaterThan(t *testing.T) {
	if !cases("2", "1", "GreaterThan") {
		t.Error("GreaterThan: expected true when key > value")
	}
	if cases("1", "2", "GreaterThan") {
		t.Error("GreaterThan: expected false when key < value")
	}
}

func TestCases_GreaterThanEqualTo(t *testing.T) {
	if !cases("2", "1", "GreaterThanEqualTo") {
		t.Error("GreaterThanEqualTo: expected true when key > value")
	}
	if !cases("1", "1", "GreaterThanEqualTo") {
		t.Error("GreaterThanEqualTo: expected true when key == value")
	}
	if cases("0", "1", "GreaterThanEqualTo") {
		t.Error("GreaterThanEqualTo: expected false when key < value")
	}
}

func TestCases_LessThanEqualTo(t *testing.T) {
	if !cases("1", "2", "LessThanEqualTo") {
		t.Error("LessThanEqualTo: expected true when key < value")
	}
	if !cases("1", "1", "LessThanEqualTo") {
		t.Error("LessThanEqualTo: expected true when key == value")
	}
	if cases("2", "1", "LessThanEqualTo") {
		t.Error("LessThanEqualTo: expected false when key > value")
	}
}

func TestCases_UnknownOperator(t *testing.T) {
	if cases("foo", "foo", "UnknownOp") {
		t.Error("UnknownOperator: expected false for unknown operator")
	}
}

// ── conditionChecker() ───────────────────────────────────────────────────────

func strPtr(s string) *string { return &s }

func makePolicy(condType string, conditions []litmuschaosv1.Condition) litmuschaosv1.EventTrackerPolicy {
	return litmuschaosv1.EventTrackerPolicy{
		Spec: litmuschaosv1.EventTrackerPolicySpec{
			ConditionType: condType,
			Conditions:    conditions,
		},
	}
}

// "and" — all conditions must match → true
func TestConditionChecker_And_AllMatch(t *testing.T) {
	policy := makePolicy("and", []litmuschaosv1.Condition{
		{Key: "metadata.name", Value: strPtr("new-name"), Operator: "EqualTo"},
	})
	oldData := map[string]interface{}{"metadata": map[string]interface{}{"name": "old-name"}}
	newData := map[string]interface{}{"metadata": map[string]interface{}{"name": "new-name"}}

	if !conditionChecker(policy, newData, oldData) {
		t.Error("and/AllMatch: expected true when condition is satisfied")
	}
}

// "and" — one condition fails → false
func TestConditionChecker_And_OneFails(t *testing.T) {
	policy := makePolicy("and", []litmuschaosv1.Condition{
		{Key: "metadata.name", Value: strPtr("new-name"), Operator: "EqualTo"},
		{Key: "metadata.namespace", Value: strPtr("prod"), Operator: "EqualTo"},
	})
	oldData := map[string]interface{}{
		"metadata": map[string]interface{}{"name": "old-name", "namespace": "dev"},
	}
	newData := map[string]interface{}{
		"metadata": map[string]interface{}{"name": "new-name", "namespace": "dev"},
	}

	// namespace condition fails (dev != prod) → whole "and" must be false
	if conditionChecker(policy, newData, oldData) {
		t.Error("and/OneFails: expected false when one condition is not satisfied")
	}
}

// "or" — at least one condition matches → true
func TestConditionChecker_Or_OneMatches(t *testing.T) {
	policy := makePolicy("or", []litmuschaosv1.Condition{
		{Key: "metadata.name", Value: strPtr("no-match"), Operator: "EqualTo"},
		{Key: "metadata.namespace", Value: strPtr("prod"), Operator: "EqualTo"},
	})
	oldData := map[string]interface{}{
		"metadata": map[string]interface{}{"name": "old-name", "namespace": "staging"},
	}
	newData := map[string]interface{}{
		"metadata": map[string]interface{}{"name": "old-name", "namespace": "prod"},
	}

	if !conditionChecker(policy, newData, oldData) {
		t.Error("or/OneMatches: expected true when at least one condition is satisfied")
	}
}

// "or" — no conditions match → false
func TestConditionChecker_Or_NoneMatch(t *testing.T) {
	policy := makePolicy("or", []litmuschaosv1.Condition{
		{Key: "metadata.name", Value: strPtr("expected-name"), Operator: "EqualTo"},
	})
	oldData := map[string]interface{}{"metadata": map[string]interface{}{"name": "same"}}
	newData := map[string]interface{}{"metadata": map[string]interface{}{"name": "same"}}

	// value didn't change so no condition fires
	if conditionChecker(policy, newData, oldData) {
		t.Error("or/NoneMatch: expected false when no condition fires (value unchanged)")
	}
}

// Change operator — value changed → true
func TestConditionChecker_ChangeOperator_ValueChanged(t *testing.T) {
	policy := makePolicy("and", []litmuschaosv1.Condition{
		{Key: "spec.replicas", Operator: "Change"},
	})
	oldData := map[string]interface{}{"spec": map[string]interface{}{"replicas": float64(1)}}
	newData := map[string]interface{}{"spec": map[string]interface{}{"replicas": float64(3)}}

	if !conditionChecker(policy, newData, oldData) {
		t.Error("Change/ValueChanged: expected true when field value changes")
	}
}

// Change operator — value unchanged → false
func TestConditionChecker_ChangeOperator_ValueUnchanged(t *testing.T) {
	policy := makePolicy("and", []litmuschaosv1.Condition{
		{Key: "spec.replicas", Operator: "Change"},
	})
	data := map[string]interface{}{"spec": map[string]interface{}{"replicas": float64(2)}}

	if conditionChecker(policy, data, data) {
		t.Error("Change/ValueUnchanged: expected false when field value stays the same")
	}
}

// Empty conditions list → false (no conditions evaluated)
func TestConditionChecker_EmptyConditions(t *testing.T) {
	policy := makePolicy("and", []litmuschaosv1.Condition{})
	data := map[string]interface{}{"metadata": map[string]interface{}{"name": "foo"}}

	if conditionChecker(policy, data, data) {
		t.Error("EmptyConditions: expected false for empty condition list")
	}
}

