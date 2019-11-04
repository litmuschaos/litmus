package chaosengine

import (
	"fmt"
	"strings"
	"testing"

	litmuschaosv1alpha1 "github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	chaosTypes "github.com/litmuschaos/chaos-operator/pkg/controller/types"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
)

func TestNewRunnerPodForCR(t *testing.T) {
	tests := map[string]struct {
		engine chaosTypes.EngineInfo
		isErr  bool
	}{
		"Test Positive-1": {
			engine: chaosTypes.EngineInfo{
				Instance: &litmuschaosv1alpha1.ChaosEngine{
					ObjectMeta: metav1.ObjectMeta{
						Name:      "test-runner",
						Namespace: "test",
					},
					Spec: litmuschaosv1alpha1.ChaosEngineSpec{
						ChaosServiceAccount: "fake-serviceAccount",
						Monitoring:          true,
						Components: litmuschaosv1alpha1.ComponentParams{
							Monitor: litmuschaosv1alpha1.MonitorInfo{
								Image: "fake-monitor-image",
							},
							Runner: litmuschaosv1alpha1.RunnerInfo{
								Image: "fake-runner-image",
							},
						},
					},
				},
				AppUUID:        "fake_id",
				AppExperiments: []string{"exp-1"},
			},
			isErr: false,
		},
		"Test Positive-2": {
			engine: chaosTypes.EngineInfo{
				Instance: &litmuschaosv1alpha1.ChaosEngine{
					ObjectMeta: metav1.ObjectMeta{
						Name:      "test-runner",
						Namespace: "test",
					},
					Spec: litmuschaosv1alpha1.ChaosEngineSpec{
						ChaosServiceAccount: "fake-serviceAccount",
						Monitoring:          false,
						Components: litmuschaosv1alpha1.ComponentParams{
							Monitor: litmuschaosv1alpha1.MonitorInfo{
								Image: "fake-monitor-image",
							},
							Runner: litmuschaosv1alpha1.RunnerInfo{
								Image: "fake-runner-image",
							},
						},
					},
				},
				AppUUID:        "fake_id",
				AppExperiments: []string{"exp-1"},
			},

			isErr: false,
		},
		"Test Negative-1": {
			engine: chaosTypes.EngineInfo{
				Instance: &litmuschaosv1alpha1.ChaosEngine{
					ObjectMeta: metav1.ObjectMeta{},
				},
				AppUUID:        "fake_id",
				AppExperiments: []string{"exp-1"},
			},
			isErr: true,
		},
		"Test Negative-2 ": {
			engine: chaosTypes.EngineInfo{
				Instance: &litmuschaosv1alpha1.ChaosEngine{
					ObjectMeta: metav1.ObjectMeta{
						Name:      "test-runner",
						Namespace: "test",
					},
					Spec: litmuschaosv1alpha1.ChaosEngineSpec{
						ChaosServiceAccount: "fake-serviceAccount",
					},
				},
				AppUUID:        "",
				AppExperiments: []string{"exp-1"},
			},
			isErr: true,
		},
		"Test Negative-3 ": {
			engine: chaosTypes.EngineInfo{
				Instance: &litmuschaosv1alpha1.ChaosEngine{
					ObjectMeta: metav1.ObjectMeta{
						Name:      "test-runner",
						Namespace: "test",
					},
					Spec: litmuschaosv1alpha1.ChaosEngineSpec{
						ChaosServiceAccount: "fake-serviceAccount",
					},
				},
				AppUUID:        "fake_id",
				AppExperiments: []string{},
			},
			isErr: true,
		},
		"Test Negative-4 ": {
			engine: chaosTypes.EngineInfo{
				Instance: &litmuschaosv1alpha1.ChaosEngine{
					ObjectMeta: metav1.ObjectMeta{
						Name:      "test-runner",
						Namespace: "test",
					},
					Spec: litmuschaosv1alpha1.ChaosEngineSpec{
						ChaosServiceAccount: "fake-serviceAccount",
						Components: litmuschaosv1alpha1.ComponentParams{
							Monitor: litmuschaosv1alpha1.MonitorInfo{
								Image: "",
							},
							Runner: litmuschaosv1alpha1.RunnerInfo{
								Image: "",
							},
						},
					},
				},
				AppUUID:        "fake_id",
				AppExperiments: []string{},
			},
			isErr: true,
		},
	}
	for name, mock := range tests {
		name, mock := name, mock
		t.Run(name, func(t *testing.T) {
			_, err := newRunnerPodForCR(mock.engine)
			if mock.isErr && err == nil {
				t.Fatalf("Test %q failed: expected error not to be nil", name)
			}
			if !mock.isErr && err != nil {
				t.Fatalf("Test %q failed: expected error to be nil", name)
			}
		})
	}
}
func TestNewMonitorServiceForCR(t *testing.T) {
	tests := map[string]struct {
		engine chaosTypes.EngineInfo
		isErr  bool
	}{
		"Test Positive": {
			engine: chaosTypes.EngineInfo{
				Instance: &litmuschaosv1alpha1.ChaosEngine{
					ObjectMeta: metav1.ObjectMeta{
						Name:      "test-monitor",
						Namespace: "test",
					},
					Spec: litmuschaosv1alpha1.ChaosEngineSpec{
						ChaosServiceAccount: "fake-serviceAccount",
						Monitoring:          false,
						Components: litmuschaosv1alpha1.ComponentParams{
							Monitor: litmuschaosv1alpha1.MonitorInfo{
								Image: "fake-monitor-image",
							},
							Runner: litmuschaosv1alpha1.RunnerInfo{
								Image: "fake-runner-image",
							},
						},
					},
				},
			},
			isErr: false,
		},
		"Test Negative": {
			engine: chaosTypes.EngineInfo{
				Instance: &litmuschaosv1alpha1.ChaosEngine{
					ObjectMeta: metav1.ObjectMeta{},
					Spec: litmuschaosv1alpha1.ChaosEngineSpec{
						Monitoring: true,
					},
				},
			},
			isErr: true,
		},
	}
	for name, mock := range tests {
		name, mock := name, mock
		t.Run(name, func(t *testing.T) {

			_, err := newMonitorServiceForCR(mock.engine)
			if mock.isErr && err == nil {
				t.Fatalf("Test %q failed: expected error not to be nil", name)
			}
			if !mock.isErr && err != nil {
				t.Fatalf("Test %q failed: expected error to be nil", name)
			}
		})
	}
}
func TestNewMonitorPodForCR(t *testing.T) {
	tests := map[string]struct {
		engine chaosTypes.EngineInfo
		isErr  bool
	}{
		"Test Positive": {
			engine: chaosTypes.EngineInfo{
				Instance: &litmuschaosv1alpha1.ChaosEngine{
					ObjectMeta: metav1.ObjectMeta{
						Name:      "test-monitor",
						Namespace: "test",
					},
					Spec: litmuschaosv1alpha1.ChaosEngineSpec{
						ChaosServiceAccount: "fake-serviceAccount",
						Monitoring:          false,
						Components: litmuschaosv1alpha1.ComponentParams{
							Monitor: litmuschaosv1alpha1.MonitorInfo{
								Image: "fake-monitor-image",
							},
							Runner: litmuschaosv1alpha1.RunnerInfo{
								Image: "fake-runner-image",
							},
						},
					},
				},
			},
			isErr: false,
		},
		"Test Negative": {
			engine: chaosTypes.EngineInfo{
				Instance: &litmuschaosv1alpha1.ChaosEngine{
					ObjectMeta: metav1.ObjectMeta{},
					Spec: litmuschaosv1alpha1.ChaosEngineSpec{
						Monitoring: true,
					},
				},
			},
			isErr: true,
		},
	}
	for name, mock := range tests {
		name, mock := name, mock
		t.Run(name, func(t *testing.T) {

			_, err := newMonitorPodForCR(mock.engine)
			if mock.isErr && err == nil {
				t.Fatalf("Test %q failed: expected error not to be nil", name)
			}
			if !mock.isErr && err != nil {
				t.Fatalf("Test %q failed: expected error to be nil", name)
			}
		})
	}
}
func TestInitializeApplicationInfo(t *testing.T) {
	tests := map[string]struct {
		instance *litmuschaosv1alpha1.ChaosEngine
		isErr    bool
	}{
		"Test Positive": {
			instance: &litmuschaosv1alpha1.ChaosEngine{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "test-monitor",
					Namespace: "test",
				},
				Spec: litmuschaosv1alpha1.ChaosEngineSpec{
					Appinfo: litmuschaosv1alpha1.ApplicationParams{
						Applabel: "key=value",
					},
				},
			},
			isErr: false,
		},
		"Test Negative": {
			instance: nil,
			isErr:    true,
		},
	}
	for name, mock := range tests {
		name, mock := name, mock
		t.Run(name, func(t *testing.T) {
			appInfo := &chaosTypes.ApplicationInfo{
				Namespace: "namespace",
				Label:     map[string]string{"fake_id": "aa"},
				ExperimentList: []litmuschaosv1alpha1.ExperimentList{
					{
						Name: "fake_name",
					},
				},
				ServiceAccountName: "fake-service-account-name",
			}
			_, err := initializeApplicationInfo(mock.instance, appInfo)
			if mock.isErr && err == nil {
				t.Fatalf("Test %q failed: expected error not to be nil", name)
			}
			if !mock.isErr && err != nil {
				fmt.Println(err)
				t.Fatalf("Test %q failed: expected error to be nil", name)
			}
		})
	}
}
func TestGetChaosRunnerENV(t *testing.T) {
	fakeEngineName := "Fake Engine"
	fakeNameSpace := "Fake NameSpace"
	fakeServiceAcc := "Fake Service Account"
	fakeAppLabel := "Fake Label"
	fakeAExList := []string{"fake string"}

	tests := map[string]struct {
		instance       *litmuschaosv1alpha1.ChaosEngine
		aExList        []string
		expectedResult []corev1.EnvVar
	}{
		"Test Positive": {
			instance: &litmuschaosv1alpha1.ChaosEngine{
				ObjectMeta: metav1.ObjectMeta{
					Name:      fakeEngineName,
					Namespace: fakeNameSpace,
				},
				Spec: litmuschaosv1alpha1.ChaosEngineSpec{
					ChaosServiceAccount: fakeServiceAcc,
					Appinfo: litmuschaosv1alpha1.ApplicationParams{
						Applabel: fakeAppLabel,
					},
				},
			},
			aExList: fakeAExList,
			expectedResult: []corev1.EnvVar{
				{
					Name:  "CHAOSENGINE",
					Value: fakeEngineName,
				},
				{
					Name:  "APP_LABEL",
					Value: fakeAppLabel,
				},
				{
					Name:  "APP_NAMESPACE",
					Value: fakeNameSpace,
				},
				{
					Name:  "EXPERIMENT_LIST",
					Value: fmt.Sprint(strings.Join(fakeAExList, ",")),
				},
				{
					Name:  "CHAOS_SVC_ACC",
					Value: fakeServiceAcc,
				},
			},
		},
	}
	for name, mock := range tests {
		name, mock := name, mock
		t.Run(name, func(t *testing.T) {
			actualResult := getChaosRunnerENV(mock.instance, mock.aExList)
			if len(actualResult) != 5 {
				t.Fatalf("Test %q failed: expected array length to be 5", name)
			}
			for index, result := range actualResult {
				if result.Value != mock.expectedResult[index].Value {
					t.Fatalf("Test %q failed: actual result %q, received result %q", name, result, mock.expectedResult[index])
				}
			}
		})
	}
}

func TestGetChaosMonitorENV(t *testing.T) {
	fakeEngineName := "Fake Engine"
	fakeNameSpace := "fake NameSpace"
	fakeAUUID := types.UID("fake UUID")

	tests := map[string]struct {
		instance       *litmuschaosv1alpha1.ChaosEngine
		aUUID          types.UID
		expectedResult []corev1.EnvVar
	}{
		"Test Positive": {
			instance: &litmuschaosv1alpha1.ChaosEngine{
				ObjectMeta: metav1.ObjectMeta{
					Name:      fakeEngineName,
					Namespace: fakeNameSpace,
				},
			},

			aUUID: fakeAUUID,
			expectedResult: []corev1.EnvVar{
				{
					Name:  "CHAOSENGINE",
					Value: fakeEngineName,
				},
				{
					Name:  "APP_UUID",
					Value: string(fakeAUUID),
				},
				{
					Name:  "APP_NAMESPACE",
					Value: fakeNameSpace,
				},
			},
		},
	}
	for name, mock := range tests {
		name, mock := name, mock
		t.Run(name, func(t *testing.T) {
			actualResult := getChaosMonitorENV(mock.instance, mock.aUUID)
			if len(actualResult) != 3 {
				t.Fatalf("Test %q failed: expected array length to be 3", name)
			}
			for index, result := range actualResult {
				if result.Value != mock.expectedResult[index].Value {
					t.Fatalf("Test %q failed: actual result %q, received result %q", name, result, mock.expectedResult[index])
				}
			}
		})
	}
}
