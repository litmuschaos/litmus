// Copyright © 2018-2019 The OpenEBS Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package podtemplatespec

import (
	"errors"
	"fmt"
	container "github.com/litmuschaos/kube-helper/kubernetes/container"
	corev1 "k8s.io/api/core/v1"
)

// PodTemplateSpec holds the api's podtemplatespec objects
type PodTemplateSpec struct {
	Object *corev1.PodTemplateSpec
}

// Builder is the builder object for Pod
type Builder struct {
	podtemplatespec *PodTemplateSpec
	errs            []error
}

// NewBuilder returns new instance of Builder
func NewBuilder() *Builder {
	return &Builder{
		podtemplatespec: &PodTemplateSpec{
			Object: &corev1.PodTemplateSpec{},
		},
	}
}

// WithName sets the Name field of podtemplatespec with provided value.
func (b *Builder) WithName(name string) *Builder {
	if len(name) == 0 {
		b.errs = append(
			b.errs,
			errors.New("failed to build podtemplatespec object: missing name"),
		)
		return b
	}
	b.podtemplatespec.Object.Name = name
	return b
}

// WithNamespace sets the Namespace field of PodTemplateSpec with provided value.
func (b *Builder) WithNamespace(namespace string) *Builder {
	if len(namespace) == 0 {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: missing namespace",
			),
		)
		return b
	}
	b.podtemplatespec.Object.Namespace = namespace
	return b
}

// WithAnnotations merges existing annotations if any
// with the ones that are provided here
func (b *Builder) WithAnnotations(annotations map[string]string) *Builder {
	if len(annotations) == 0 {
		b.errs = append(
			b.errs,
			errors.New("failed to build deployment object: missing annotations"),
		)
		return b
	}

	if b.podtemplatespec.Object.Annotations == nil {
		return b.WithAnnotationsNew(annotations)
	}

	for key, value := range annotations {
		b.podtemplatespec.Object.Annotations[key] = value
	}
	return b
}

// WithAnnotationsNew resets the annotation field of podtemplatespec
// with provided arguments
func (b *Builder) WithAnnotationsNew(annotations map[string]string) *Builder {
	if len(annotations) == 0 {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: missing annotations",
			),
		)
		return b
	}

	// copy of original map
	newannotations := map[string]string{}
	for key, value := range annotations {
		newannotations[key] = value
	}

	// override
	b.podtemplatespec.Object.Annotations = newannotations
	return b
}

// WithLabels merges existing labels if any
// with the ones that are provided here
func (b *Builder) WithLabels(labels map[string]string) *Builder {
	if len(labels) == 0 {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: missing labels",
			),
		)
		return b
	}

	if b.podtemplatespec.Object.Labels == nil {
		return b.WithLabelsNew(labels)
	}

	for key, value := range labels {
		b.podtemplatespec.Object.Labels[key] = value
	}
	return b
}

// WithLabelsNew resets the labels field of podtemplatespec
// with provided arguments
func (b *Builder) WithLabelsNew(labels map[string]string) *Builder {
	if len(labels) == 0 {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: missing labels",
			),
		)
		return b
	}

	// copy of original map
	newlbls := map[string]string{}
	for key, value := range labels {
		newlbls[key] = value
	}

	// override
	b.podtemplatespec.Object.Labels = newlbls
	return b
}

// WithNodeSelector merges the nodeselectors if present
// with the provided arguments
func (b *Builder) WithNodeSelector(nodeselectors map[string]string) *Builder {
	if len(nodeselectors) == 0 {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: missing nodeselectors",
			),
		)
		return b
	}

	if b.podtemplatespec.Object.Spec.NodeSelector == nil {
		return b.WithNodeSelectorNew(nodeselectors)
	}

	for key, value := range nodeselectors {
		b.podtemplatespec.Object.Spec.NodeSelector[key] = value
	}
	return b
}

// WithNodeSelectorNew resets the nodeselector field of podtemplatespec
// with provided arguments
func (b *Builder) WithNodeSelectorNew(nodeselectors map[string]string) *Builder {
	if len(nodeselectors) == 0 {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: missing nodeselectors",
			),
		)
		return b
	}

	// copy of original map
	newnodeselectors := map[string]string{}
	for key, value := range nodeselectors {
		newnodeselectors[key] = value
	}

	// override
	b.podtemplatespec.Object.Spec.NodeSelector = newnodeselectors
	return b
}

// WithServiceAccountName sets the ServiceAccountnNme field of podtemplatespec
func (b *Builder) WithServiceAccountName(serviceAccountnNme string) *Builder {
	if len(serviceAccountnNme) == 0 {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: missing serviceaccountname",
			),
		)
		return b
	}

	b.podtemplatespec.Object.Spec.ServiceAccountName = serviceAccountnNme
	return b
}

// WithAffinity sets the affinity field of podtemplatespec
func (b *Builder) WithAffinity(affinity *corev1.Affinity) *Builder {
	if affinity == nil {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: missing affinity",
			),
		)
		return b
	}

	// copy of original pointer
	newaffinitylist := *affinity

	b.podtemplatespec.Object.Spec.Affinity = &newaffinitylist
	return b
}

// WithTolerations merges the existing tolerations
// with the provided arguments
func (b *Builder) WithTolerations(tolerations ...corev1.Toleration) *Builder {
	if tolerations == nil {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: nil tolerations",
			),
		)
		return b
	}
	if len(tolerations) == 0 {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: missing tolerations",
			),
		)
		return b
	}

	if len(b.podtemplatespec.Object.Spec.Tolerations) == 0 {
		return b.WithTolerationsNew(tolerations...)
	}

	b.podtemplatespec.Object.Spec.Tolerations = append(
		b.podtemplatespec.Object.Spec.Tolerations,
		tolerations...,
	)

	return b
}

// WithTolerationsNew sets the tolerations field of podtemplatespec
func (b *Builder) WithTolerationsNew(tolerations ...corev1.Toleration) *Builder {
	if tolerations == nil {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: nil tolerations",
			),
		)
		return b
	}
	if len(tolerations) == 0 {
		b.errs = append(
			b.errs,
			errors.New(
				"failed to build podtemplatespec object: missing tolerations",
			),
		)
		return b
	}

	// copy of original slice
	newtolerations := []corev1.Toleration{}
	newtolerations = append(newtolerations, tolerations...)

	b.podtemplatespec.Object.Spec.Tolerations = newtolerations

	return b
}

// WithContainerBuilders builds the list of containerbuilder
// provided and merges it to the containers field of the podtemplatespec
func (b *Builder) WithContainerBuilders(
	containerBuilderList ...*container.Builder,
) *Builder {
	if containerBuilderList == nil {
		b.errs = append(
			b.errs,
			errors.New("failed to build podtemplatespec: nil containerbuilder"),
		)
		return b
	}
	for _, containerBuilder := range containerBuilderList {
		containerObj, err := containerBuilder.Build()
		if err != nil {
			b.errs = append(b.errs, fmt.Errorf("failed to build deployment %v", err))
			return b
		}
		b.podtemplatespec.Object.Spec.Containers = append(
			b.podtemplatespec.Object.Spec.Containers,
			containerObj,
		)
	}
	return b
}

// WithVolumeBuilders builds the list of volumebuilders provided
// and merges it to the volumes field of podtemplatespec.
/*func (b *Builder) WithVolumeBuilders(
	volumeBuilderList ...*volume.Builder,
) *Builder {
	if volumeBuilderList == nil {
		b.errs = append(
			b.errs,
			errors.New("failed to build podtemplatespec: nil volumeBuilderList"),
		)
		return b
	}
	for _, volumeBuilder := range volumeBuilderList {
		vol, err := volumeBuilder.Build()
		if err != nil {
			b.errs = append(
				b.errs,
				errors.Wrap(err, "failed to build podtemplatespec"),
			)
			return b
		}
		newvol := *vol
		b.podtemplatespec.Object.Spec.Volumes = append(
			b.podtemplatespec.Object.Spec.Volumes,
			newvol,
		)
	}
	return b
}
*/
// WithContainerBuildersNew builds the list of containerbuilder
// provided and sets the containers field of the podtemplatespec
func (b *Builder) WithContainerBuildersNew(
	containerBuilderList ...*container.Builder,
) *Builder {
	if containerBuilderList == nil {
		b.errs = append(
			b.errs,
			errors.New("failed to build podtemplatespec: nil containerbuilder"),
		)
		return b
	}
	if len(containerBuilderList) == 0 {
		b.errs = append(
			b.errs,
			errors.New("failed to build podtemplatespec: missing containerbuilder"),
		)
		return b
	}
	containerList := []corev1.Container{}
	for _, containerBuilder := range containerBuilderList {
		containerObj, err := containerBuilder.Build()
		if err != nil {
			b.errs = append(
				b.errs,
				errors.New("failed to build Podspectemplate"),
			)
			return b
		}
		containerList = append(
			containerList,
			containerObj,
		)
	}
	b.podtemplatespec.Object.Spec.Containers = containerList
	return b
}

// WithVolumeBuildersNew builds the list of volumebuilders provided
// and sets Volumes field of podtemplatespec.
/*
func (b *Builder) WithVolumeBuildersNew(
	volumeBuilderList ...*volume.Builder,
) *Builder {
	if volumeBuilderList == nil {
		b.errs = append(
			b.errs,
			errors.New("failed to build podtemplatespec: nil volumeBuilderList"),
		)
		return b
	}
	if len(volumeBuilderList) == 0 {
		b.errs = append(
			b.errs,
			errors.New("failed to build podtemplatespec: missing volumeBuilderList"),
		)
		return b
	}
	volList := []corev1.Volume{}
	for _, volumeBuilder := range volumeBuilderList {
		vol, err := volumeBuilder.Build()
		if err != nil {
			b.errs = append(
				b.errs,
				errors.Wrap(err, "failed to build podtemplatespec"),
			)
			return b
		}
		newvol := *vol
		volList = append(
			volList,
			newvol,
		)
	}
	b.podtemplatespec.Object.Spec.Volumes = volList
	return b
}
*/
// Build returns a deployment instance
func (b *Builder) Build() (*PodTemplateSpec, error) {
	err := b.validate()
	if err != nil {
		return nil, fmt.Errorf("%+v", b.errs)
	}
	return b.podtemplatespec, nil
}

func (b *Builder) validate() error {
	if len(b.errs) != 0 {
		return fmt.Errorf(
			"failed to validate: build errors were found: %v",
			b.errs,
		)
	}
	return nil
}
