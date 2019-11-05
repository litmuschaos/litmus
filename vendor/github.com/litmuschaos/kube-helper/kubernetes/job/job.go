package job

import (
	batchv1 "k8s.io/api/batch/v1"
)

type Job struct {
	object *batchv1.Job
}
