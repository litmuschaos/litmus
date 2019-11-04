package controller

import (
	"github.com/litmuschaos/chaos-operator/pkg/controller/chaosengine"
)

func init() {
	// AddToManagerFuncs is a list of functions to create controllers and add them to a manager.
	AddToManagerFuncs = append(AddToManagerFuncs, chaosengine.Add)
}
