package container

import (
	corev1 "k8s.io/api/core/v1"
)

type container struct {
	object corev1.Container
}
