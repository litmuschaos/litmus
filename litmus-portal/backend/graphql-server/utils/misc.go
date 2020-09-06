package utils

import (
	"bufio"
	"errors"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"strings"
)

//WriteHeaders adds important headers to API responses
func WriteHeaders(w *http.ResponseWriter, statusCode int) {
	(*w).Header().Set("Content-Type", "application/json; charset=utf-8")
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).WriteHeader(statusCode)
}

//RandomString generates random strings, can be used to create ids or random secrets
func RandomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-")
	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}

//ManifestParser parses manifests yaml and generates dynamic manifest with specified keys
func ManifestParser(id, key, server, template string) ([]byte, error) {
	file, err := os.Open(template)
	if err != nil {
		return []byte{}, err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	var lines []string

	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "#{CID}") {
			line = strings.Replace(line, "#{CID}", id, -1)
		} else if strings.Contains(line, "#{KEY}") {
			line = strings.Replace(line, "#{KEY}", key, -1)
		} else if strings.Contains(line, "#{SERVER}") {
			line = strings.Replace(line, "#{SERVER}", server, -1)
		}
		lines = append(lines, line)
	}

	if err := scanner.Err(); err != nil {
		return []byte{}, err
	}

	return []byte(strings.Join(lines, "\n")), nil
}

//EmbedWorkflowIDIntoManifest embeds workflow schedule ids into workflow manifests and returns the updated manifest
func EmbedWorkflowIDIntoManifest(workflowID string, workflowManifest string) (string, error) {

	metadataStringPattern := regexp.MustCompile(`"metadata": {\n.*\n  },`)

	metaDataLoc := metadataStringPattern.FindIndex([]byte(workflowManifest))

	if len(metaDataLoc) == 2 {

		preMetaDetails := workflowManifest[0 : metaDataLoc[1]-5]

		postMetaDetails := workflowManifest[metaDataLoc[1]-5 : len(workflowManifest)]

		manifestMappedToWorkflowScheduleID := preMetaDetails + ",\n    " + `"labels": {` + "\n      " + `"wfid": "` + workflowID + `"` + "\n    }" + postMetaDetails

		return manifestMappedToWorkflowScheduleID, nil
	}
	return " ", errors.New("workflow meta-data not found")

}
