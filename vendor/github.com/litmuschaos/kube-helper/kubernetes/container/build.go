package container

import (
	"errors"

	corev1 "k8s.io/api/core/v1"
)

// Builder is the builder object for container
type Builder struct {
	con    *container // container instance
	errors []error    // errors found while building the container instance
}

// NewBuilder returns a new instance of builder
func NewBuilder() *Builder {
	return &Builder{
		con: &container{},
	}
}

// validate will run checks against container instance
func (b *Builder) validate() error {

	if len(b.errors) == 0 {
		return nil
	}
	return errors.New("failed")
}

// Build returns the final kubernetes container
func (b *Builder) Build() (corev1.Container, error) {
	err := b.validate()
	if err != nil {
		return corev1.Container{}, err
	}
	return b.con.object, nil
}

// WithName sets the name of the container
func (b *Builder) WithName(name string) *Builder {
	if len(name) == 0 {
		b.errors = append(
			b.errors,
			errors.New("failed to build container object: missing name"),
		)
		return b
	}
	b.con.object.Name = name
	return b
}

// WithImage sets the image of the container
func (b *Builder) WithImage(img string) *Builder {
	if len(img) == 0 {
		b.errors = append(
			b.errors,
			errors.New("failed to build container object: missing image"),
		)
		return b
	}
	b.con.object.Image = img
	return b
}

// WithImagePullPolicy sets the image pull policy of the container
func (b *Builder) WithImagePullPolicy(policy corev1.PullPolicy) *Builder {
	if len(policy) == 0 {
		b.errors = append(
			b.errors,
			errors.New(
				"failed to build container object: missing imagepullpolicy",
			),
		)
		return b
	}

	b.con.object.ImagePullPolicy = policy
	return b
}

// WithCommandNew sets the command of the container
func (b *Builder) WithCommandNew(cmd []string) *Builder {
	if cmd == nil {
		b.errors = append(
			b.errors,
			errors.New("failed to build container object: nil command"),
		)
		return b
	}

	if len(cmd) == 0 {
		b.errors = append(
			b.errors,
			errors.New("failed to build container object: missing command"),
		)
		return b
	}

	newcmd := []string{}
	newcmd = append(newcmd, cmd...)

	b.con.object.Command = newcmd
	return b
}

// WithArgumentsNew sets the command arguments of the container
func (b *Builder) WithArgumentsNew(args []string) *Builder {
	if args == nil {
		b.errors = append(
			b.errors,
			errors.New("failed to build container object: nil arguments"),
		)
		return b
	}

	if len(args) == 0 {
		b.errors = append(
			b.errors,
			errors.New("failed to build container object: missing arguments"),
		)
		return b
	}

	newargs := []string{}
	newargs = append(newargs, args...)

	b.con.object.Args = newargs
	return b
}

// WithEnvsNew sets the envs of the container
func (b *Builder) WithEnvsNew(envs []corev1.EnvVar) *Builder {
	if envs == nil {
		b.errors = append(
			b.errors,
			errors.New("failed to build container object: nil envs"),
		)
		return b
	}

	if len(envs) == 0 {
		b.errors = append(
			b.errors,
			errors.New("failed to build container object: missing envs"),
		)
		return b
	}

	newenvs := []corev1.EnvVar{}
	newenvs = append(newenvs, envs...)

	b.con.object.Env = newenvs
	return b
}

// WithPortsNew sets ports of the container
func (b *Builder) WithPortsNew(ports []corev1.ContainerPort) *Builder {
	if len(ports) == 0 {
		b.errors = append(
			b.errors,
			errors.New("failed to build container object: missing ports"),
		)
		return b
	}

	newports := []corev1.ContainerPort{}
	newports = append(newports, ports...)

	b.con.object.Ports = newports
	return b
}
