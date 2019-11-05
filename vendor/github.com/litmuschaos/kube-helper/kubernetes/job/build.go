package job

import (
	"errors"
	"fmt"
	templatespec "github.com/litmuschaos/kube-helper/kubernetes/podtemplatespec"
	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
)

type Builder struct {
	job  *Job
	errs []error
}

func NewBuilder() *Builder {
	return &Builder{
		job: &Job{
			object: &batchv1.Job{},
		},
	}
}

func (b *Builder) WithName(name string) *Builder {
	if len(name) == 0 {
		b.errs = append(
			b.errs,
			errors.New("Failed to build Job object: missing Job Name"),
		)
		return b
	}
	b.job.object.Name = name
	return b
}

func (b *Builder) WithNamespace(namespace string) *Builder {
	if len(namespace) == 0 {
		b.errs = append(
			b.errs,
			errors.New("failed to build Job object: missing namespace"),
		)
		return b
	}
	b.job.object.Namespace = namespace
	return b
}

func (b *Builder) WithLabels(labels map[string]string) *Builder {
	if len(labels) == 0 {
		b.errs = append(
			b.errs,
			errors.New("failed to build Job object: missing labels"),
		)
		return b
	}

	if b.job.object.Labels == nil {
		b.job.object.Labels = map[string]string{}
	}

	for key, value := range labels {
		b.job.object.Labels[key] = value
	}
	return b
}

func (b *Builder) WithPodTemplateSpecBuilder(
	tmplbuilder *templatespec.Builder,
) *Builder {
	if tmplbuilder == nil {
		b.errs = append(
			b.errs,
			errors.New("failed to build job: nil templatespecbuilder"),
		)
		return b
	}

	templatespecObj, err := tmplbuilder.Build()

	if err != nil {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build job"),
		)
		return b
	}
	b.job.object.Spec.Template = *templatespecObj.Object
	return b
}
func (b *Builder) WithBackOffLimit(backoff *int32) *Builder {
	if int(*backoff) < 0 {
		b.errs = append(
			b.errs,
			errors.New("failed to build Job: invalid backofflimit "),
		)
		return b
	}

	b.job.object.Spec.BackoffLimit = backoff
	return b
}
func (b *Builder) WithRestartPolicy(restartPolicy corev1.RestartPolicy) *Builder {
	b.job.object.Spec.Template.Spec.RestartPolicy = restartPolicy
	return b
}
func (b *Builder) Build() (*batchv1.Job, error) {
	if len(b.errs) > 0 {
		return nil, fmt.Errorf("%+v", b.errs)
	}
	return b.job.object, nil
}
