package service

import (
	corev1 "k8s.io/api/core/v1"
)

// Service is a wrapper over service api
// object. It provides build, validations and other common
// logic to be used by various feature specific callers.
type Service struct {
	object *corev1.Service
}
