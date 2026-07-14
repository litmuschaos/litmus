package k8s

import (
	"bytes"
	"context"
	"io"
	"strconv"
	"strings"

	"subscriber/pkg/types"

	"github.com/sirupsen/logrus"

	v1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
)

func (k8s *k8sSubscriber) GetLogs(podName, namespace, container string) (string, error) {
	ctx := context.TODO()
	conf, err := k8s.GetKubeConfig()
	if err != nil {
		return "", err
	}

	podLogOpts := v1.PodLogOptions{}
	if container != "" {
		podLogOpts.Container = container
	}

	// creates the clientset
	clientset, err := kubernetes.NewForConfig(conf)
	if err != nil {
		return "", err
	}

	req := clientset.CoreV1().Pods(namespace).GetLogs(podName, &podLogOpts)
	podLogs, err := req.Stream(ctx)
	if err != nil {
		return "", err
	}

	defer podLogs.Close()

	buf := new(bytes.Buffer)
	_, err = io.Copy(buf, podLogs)
	if err != nil {
		return "", err
	}

	str := buf.String()

	return str, nil
}

// create pod log for normal pods and chaos-engine pods
func (k8s *k8sSubscriber) CreatePodLog(podLog types.PodLogRequest) (types.PodLog, error) {
	logDetails := types.PodLog{}
	mainLog, err := k8s.GetLogs(podLog.PodName, podLog.PodNamespace, "main")
	// try getting argo pod logs
	if err != nil {
		logrus.Errorf("Failed to get argo pod %v logs, err: %v", podLog.PodName, err)
		logDetails.MainPod = "Failed to get argo pod logs"
	} else {
		logDetails.MainPod = strconv.Quote(strings.Replace(mainLog, `"`, `'`, -1))
		logDetails.MainPod = logDetails.MainPod[1 : len(logDetails.MainPod)-1]
	}
	// try getting experiment pod logs if requested
	if strings.ToLower(podLog.PodType) == "chaosengine" && podLog.ChaosNamespace != nil {
		chaosLog := make(map[string]string)
		if podLog.ExpPod != nil {
			expLog, err := k8s.GetLogs(*podLog.ExpPod, *podLog.ChaosNamespace, "")
			if err == nil {
				chaosLog[*podLog.ExpPod] = strconv.Quote(strings.Replace(expLog, `"`, `'`, -1))
				chaosLog[*podLog.ExpPod] = chaosLog[*podLog.ExpPod][1 : len(chaosLog[*podLog.ExpPod])-1]
			} else {
				logrus.Errorf("Failed to get experiment pod %v logs, err: %v", *podLog.ExpPod, err)
			}
		}
		if podLog.RunnerPod != nil {
			runnerLog, err := k8s.GetLogs(*podLog.RunnerPod, *podLog.ChaosNamespace, "")
			if err == nil {
				chaosLog[*podLog.RunnerPod] = strconv.Quote(strings.Replace(runnerLog, `"`, `'`, -1))
				chaosLog[*podLog.RunnerPod] = chaosLog[*podLog.RunnerPod][1 : len(chaosLog[*podLog.RunnerPod])-1]
			} else {
				logrus.Errorf("Failed to get runner pod %v logs, err: %v", *podLog.RunnerPod, err)
			}
		}
		if podLog.ExpPod == nil && podLog.RunnerPod == nil {
			logDetails.ChaosPod = nil
		} else {
			logDetails.ChaosPod = chaosLog
		}
	}
	return logDetails, nil
}

// SendPodLogs generates graphql mutation to send events updates to graphql server
func (k8s *k8sSubscriber) SendPodLogs(infraData map[string]string, podLog types.PodLogRequest) {
	// generate graphql payload
	payload, err := k8s.GenerateLogPayload(infraData["INFRA_ID"], infraData["ACCESS_KEY"], infraData["VERSION"], podLog)
	if err != nil {
		logrus.WithError(err).Print("Error while retrieving the workflow logs")
	}
	body, err := k8s.gqlSubscriberServer.SendRequest(infraData["SERVER_ADDR"], payload)
	if err != nil {
		logrus.Print(err.Error())
	}
	logrus.Print("Response from the server: ", body)
}

func (k8s *k8sSubscriber) GenerateLogPayload(cid, accessKey, version string, podLog types.PodLogRequest) ([]byte, error) {
	infraID := `{infraID: \"` + cid + `\", version: \"` + version + `\", accessKey: \"` + accessKey + `\"}`
	processed := " Could not get logs "

	// get the logs
	logDetails, err := k8s.CreatePodLog(podLog)
	if err == nil {
		// process log data
		processed, err = k8s.gqlSubscriberServer.MarshalGQLData(logDetails)
		if err != nil {
			processed = " Could not get logs "
		}
	}

	mutation := `{ infraID: ` + infraID + `, requestID:\"` + podLog.RequestID + `\", experimentRunID: \"` + podLog.ExperimentRunID + `\", podName: \"` + podLog.PodName + `\", podType: \"` + podLog.PodType + `\", log:\"` + processed[1:len(processed)-1] + `\"}`
	var payload = []byte(`{"query":"mutation { podLog(request:` + mutation + ` )}"}`)

	return payload, nil
}
