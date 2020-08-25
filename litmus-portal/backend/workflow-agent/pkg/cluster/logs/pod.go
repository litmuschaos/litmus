package logs

import (
	"bytes"
	"io"

	"github.com/litmuschaos/litmus/litmus-portal/backend/workflow-agent/pkg/k8s"
	v1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
)

func GetLogs(podName, namespace, container string) (string, error) {
	conf, err := k8s.GetKubeConfig()
	podLogOpts := v1.PodLogOptions{}
	if container != "" {
		podLogOpts.Container = container
	}
	if err != nil {
		return "", err
	}
	// creates the clientset
	clientset, err := kubernetes.NewForConfig(conf)
	if err != nil {
		return "", err
	}
	req := clientset.CoreV1().Pods(namespace).GetLogs(podName, &podLogOpts)
	podLogs, err := req.Stream()
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
