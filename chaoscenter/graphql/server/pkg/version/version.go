package version

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"

	"github.com/harness/hce-saas/graphql/server/utils"

	"github.com/ghodss/yaml"
	"github.com/sirupsen/logrus"
)

type Metadata struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

type VersionInfo struct {
	Version   string `json:"version"`
	BuildNo   string `json:"buildNo"`
	GitCommit string `json:"gitCommit"`
	GitBranch string `json:"gitBranch"`
	Timestamp string `json:"timestamp"`
	Patch     string `json:"patch"`
}

type Resource struct {
	VersionInfo VersionInfo `json:"versionInfo"`
}

type Version struct {
	MetaData         Metadata `json:"metaData"`
	Resource         Resource `json:"resource"`
	ResponseMessages []string `json:"responseMessages"`
}

func InitVersionInfo(w http.ResponseWriter, r *http.Request) {

	var defaultVersionPath string
	defaultVersionPath, err := filepath.Abs("pkg/version/versionInfo.yaml")
	if err != nil {
		logrus.Error(err)
		w.WriteHeader(500)
		w.Write([]byte(err.Error()))
	}

	var versionInfoPath string
	if chaosManagerVersionInfoPath, ok := os.LookupEnv("CHAOS_MANAGER_VERSION_PATH"); ok {
		versionInfoPath = chaosManagerVersionInfoPath
	} else {
		versionInfoPath = defaultVersionPath
	}

	file, err := ioutil.ReadFile(versionInfoPath)
	if err != nil {
		logrus.Error(err)
		utils.WriteHeaders(&w, 500)
		w.Write([]byte(err.Error()))
	}

	var versionYAML Version

	err = yaml.Unmarshal(file, &versionYAML)
	if err != nil {
		logrus.Error(err)
		utils.WriteHeaders(&w, 500)
		w.Write([]byte(err.Error()))
	}

	versionData, err := json.Marshal(versionYAML)
	if err != nil {
		logrus.Error(err)
		utils.WriteHeaders(&w, 500)
		w.Write([]byte(err.Error()))
	}

	utils.WriteHeaders(&w, 200)
	w.Write(versionData)
}
