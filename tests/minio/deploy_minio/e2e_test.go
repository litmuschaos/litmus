/*
Copyright 2018 The OpenEBS Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"fmt"

	"github.com/DATA-DOG/godog"
	"github.com/DATA-DOG/godog/gherkin"
	"github.com/openebs/litmus/pkg/kubectl"
	"github.com/openebs/litmus/pkg/time"
	"github.com/openebs/litmus/pkg/verify"
)

// errorIdentity is a type to set error identities
type errorIdentity string

const (
	// OperatorVerifyFileEI stores the actual error during load of volume
	// operator verify file
	OperatorVerifyFileEI errorIdentity = "operator-verify-file-err"
	// ApplicationVerifyFileEI stores the actual error during load of application
	// verify file
	ApplicationVerifyFileEI errorIdentity = "application-verify-file-err"
	// VolumeVerifyFileEI stores the actual error during load of volume verify
	// file
	VolumeVerifyFileEI errorIdentity = "volume-verify-file-err"
)

const (
	// OperatorMF enables litmus to run checks & actions based on this volume
	// operator verify file
	OperatorMF verify.VerifyFile = "/etc/e2e/operator-verify/operator-verify.yaml"
	// ApplicationMF enables litmus to run checks & actions based on this application
	// verify file
	ApplicationMF verify.VerifyFile = "/etc/e2e/application-verify/application-verify.yaml"
	// VolumeMF enables litmus to run checks & actions based on this volume verify
	// file
	VolumeMF verify.VerifyFile = "/etc/e2e/volume-verify/volume-verify.yaml"
)

const (
	// ApplicationKF is launched via kubectl
	ApplicationKF kubectl.KubectlFile = "/etc/e2e/application-launch/application-launch.yaml"
)

const (
	// PVCAlias is the alias name given to a application's pvc
	//
	// This is the text which is typically understood by the end user. This text
	// which will be set in the verify file against a particular component.
	// Verification logic will filter the component based on this alias & run
	// various checks &/or actions
	PVCAlias string = "pvc"
)

type MinioLaunch struct {
	// appVerifier instance enables verification of application components
	appVerifier verify.AllVerifier
	// volVerifier instance enables verification of persistent volume components
	volVerifier verify.AllVerifier
	// operatorVerifier instance enables verification of volume operator components
	operatorVerifier verify.DeployRunVerifier
	// errors hold the previous error(s)
	errors map[errorIdentity]error
}

func (e2e *MinioLaunch) withOperatorVerifier(f *gherkin.Feature) {
	o, err := verify.NewKubeInstallVerify(OperatorMF)
	if err != nil {
		e2e.errors[OperatorVerifyFileEI] = err
		return
	}
	e2e.operatorVerifier = o
}

func (e2e *MinioLaunch) withApplicationVerifier(f *gherkin.Feature) {
	a, err := verify.NewKubeInstallVerify(ApplicationMF)
	if err != nil {
		e2e.errors[ApplicationVerifyFileEI] = err
		return
	}
	e2e.appVerifier = a
}

func (e2e *MinioLaunch) withVolumeVerifier(f *gherkin.Feature) {
	v, err := verify.NewKubeInstallVerify(VolumeMF)
	if err != nil {
		e2e.errors[VolumeVerifyFileEI] = err
		return
	}
	e2e.volVerifier = v
}

func (e2e *MinioLaunch) tearDown(f *gherkin.Feature) {
	kubectl.New().Run([]string{"delete", "-f", string(ApplicationKF)})
}

func (e2e *MinioLaunch) iHaveAKubernetesClusterWithVolumeOperatorInstalled() (err error) {
	kconnVerifier := verify.NewKubeConnectionVerify()
	// checks if kubernetes cluster is available & is connected
	_, err = kconnVerifier.IsConnected()
	if err != nil {
		return
	}

	if e2e.operatorVerifier == nil {
		err = fmt.Errorf("nil operator verifier: possible error '%s'", e2e.errors[OperatorVerifyFileEI])
		return
	}

	// checks if operator is deployed
	_, err = e2e.operatorVerifier.IsDeployed()
	if err != nil {
		return
	}

	// checks if operator is running
	_, err = e2e.operatorVerifier.IsRunning()

	return
}

func (e2e *MinioLaunch) waitFor(duration string) (err error) {
	err = time.WaitFor(duration)
	return
}

func (e2e *MinioLaunch) iLaunchMinioApplicationOnVolume() (err error) {
	// do a kubectl apply of application yaml
	_, err = kubectl.New().Run([]string{"apply", "-f", string(ApplicationKF)})
	return
}

func (e2e *MinioLaunch) verifyMinioApplicationIsLaunchedSuccessfullyOnVolume() (err error) {
	err = e2e.verifyApplicationIsRunning()
	if err != nil {
		return
	}

	// check if volume is running
	return e2e.verifyAllVolumeReplicasAreRunning()
}

func (e2e *MinioLaunch) verifyApplicationIsRunning() (err error) {
	if e2e.appVerifier == nil {
		err = fmt.Errorf("nil application verifier: possible error '%s'", e2e.errors[ApplicationVerifyFileEI])
		return
	}

	// is application deployed
	_, err = e2e.appVerifier.IsDeployed()
	if err != nil {
		return
	}

	// is application running
	_, err = e2e.appVerifier.IsRunning()
	return
}

func (e2e *MinioLaunch) verifyAllVolumeReplicasAreRunning() (err error) {
	if e2e.volVerifier == nil {
		err = fmt.Errorf("nil volume verifier: possible error '%s'", e2e.errors[VolumeVerifyFileEI])
		return
	}

	// is volume deployed
	_, err = e2e.volVerifier.IsDeployed()
	if err != nil {
		return
	}

	// is volume running
	_, err = e2e.volVerifier.IsRunning()
	return
}

func (e2e *MinioLaunch) minioApplicationIsLaunchedSuccessfullyOnVolume() (err error) {
	// check if application is running
	return e2e.verifyMinioApplicationIsLaunchedSuccessfullyOnVolume()
}

func (e2e *MinioLaunch) verifyPVCIsBound() (err error) {
	if e2e.appVerifier == nil {
		err = fmt.Errorf("nil application verifier: possible error '%s'", e2e.errors[ApplicationVerifyFileEI])
		return
	}

	// is condition satisfied
	_, err = e2e.appVerifier.IsCondition(PVCAlias, verify.PVCBoundCond)
	return
}

func (e2e *MinioLaunch) verifyPVIsDeployed() (err error) {
	if e2e.volVerifier == nil {
		err = fmt.Errorf("nil volume verifier: possible error '%s'", e2e.errors[VolumeVerifyFileEI])
		return
	}

	// is volume deployed
	_, err = e2e.volVerifier.IsDeployed()
	if err != nil {
		return
	}

	// is volume running
	_, err = e2e.volVerifier.IsRunning()
	return
}

func (e2e *MinioLaunch) iDeleteMinioInstanceAlongWithVolume() (err error) {
	kubectl.New().Run([]string{"delete", "-f", string(ApplicationKF)})
	return
}

func (e2e *MinioLaunch) verifyMinioApplicationIsDeleted() (err error) {
	if e2e.appVerifier == nil {
		err = fmt.Errorf("nil application verifier: possible error '%s'", e2e.errors[ApplicationVerifyFileEI])
		return
	}

	// is application deleted
	_, err = e2e.appVerifier.IsDeleted()
	return
}

func (e2e *MinioLaunch) verifyPVIsDeleted() (err error) {
	if e2e.volVerifier == nil {
		err = fmt.Errorf("nil volume verifier: possible error '%s'", e2e.errors[VolumeVerifyFileEI])
		return
	}

	// is volume deployed
	_, err = e2e.volVerifier.IsDeleted()
	return
}

func FeatureContext(s *godog.Suite) {
	e2e := &MinioLaunch{
		errors: map[errorIdentity]error{},
	}

	s.BeforeFeature(e2e.withOperatorVerifier)
	s.BeforeFeature(e2e.withApplicationVerifier)
	s.BeforeFeature(e2e.withVolumeVerifier)

	s.AfterFeature(e2e.tearDown)

	s.Step(`^I have a kubernetes cluster with volume operator installed$`, e2e.iHaveAKubernetesClusterWithVolumeOperatorInstalled)
	s.Step(`^wait for "([^"]*)"$`, e2e.waitFor)
	s.Step(`^I launch minio application on volume$`, e2e.iLaunchMinioApplicationOnVolume)
	s.Step(`^verify minio application is launched successfully on volume$`, e2e.verifyMinioApplicationIsLaunchedSuccessfullyOnVolume)
	s.Step(`^verify PVC is bound$`, e2e.verifyPVCIsBound)
	s.Step(`^verify PV is deployed$`, e2e.verifyPVIsDeployed)
	s.Step(`^I delete minio instance along with volume$`, e2e.iDeleteMinioInstanceAlongWithVolume)
	s.Step(`^verify minio application is deleted$`, e2e.verifyMinioApplicationIsDeleted)
	s.Step(`^verify PV is deleted$`, e2e.verifyPVIsDeleted)
	s.Step(`^minio application is launched successfully on volume$`, e2e.minioApplicationIsLaunchedSuccessfullyOnVolume)
}
