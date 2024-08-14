package handler

import (
	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"os"
	"testing"
	"path/filepath"
	"strings"
	"encoding/json"
	"fmt"
)

func FuzzGetChartsPath(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)

		chartsInput := model.CloningInput{}
		err := fuzzConsumer.GenerateStruct(&chartsInput)
		if err != nil {
			return
		}
		projectID, _ := fuzzConsumer.GetString()
		isDefault, _ := fuzzConsumer.GetBool()

		result := GetChartsPath(chartsInput, projectID, isDefault)

		if isDefault {
			expected := DefaultPath + "default/" + chartsInput.Name + "/faults/"
			if result != expected {
				t.Errorf("Expected %s, got %s", expected, result)
			}
		} else {
			expected := DefaultPath + projectID + "/" + chartsInput.Name + "/faults/"
			if result != expected {
				t.Errorf("Expected %s, got %s", expected, result)
			}
		}
	})
}

func FuzzReadExperimentFile(f *testing.F) {
    f.Fuzz(func(t *testing.T, data []byte, filename string) {
        fuzzConsumer := fuzz.NewConsumer(data)

        // Create a temporary directory
        tmpDir, err := os.MkdirTemp("", "*-fuzztest")
        if err != nil {
            t.Fatal(err)
        }
        defer os.RemoveAll(tmpDir) // clean up

        // Ensure the filename is valid and unique
        safeFilename := filepath.Clean(filepath.Base(filename))
        if isInvalidFilename(safeFilename) {
            safeFilename = "test.yaml"
        }
        filePath := filepath.Join(tmpDir, safeFilename)
        content := ChaosChart{}
        err = fuzzConsumer.GenerateStruct(&content)
        if err != nil {
            return
        }
		fmt.Print(filePath)
        jsonContent, _ := json.Marshal(content)
        err = os.WriteFile(filePath, jsonContent, 0644)
        if err != nil {
            t.Fatal(err)
        }

        _, err = ReadExperimentFile(filePath)

        if strings.HasSuffix(safeFilename, ".yaml") {
            if err != nil && !isInvalidYAML(jsonContent) {
                t.Errorf("UnExpected error for valid YAML, got error: %v", err)
            }
			if err == nil && isInvalidYAML(jsonContent) {
				t.Errorf("Expected error for invalid YAML, got nil")
			}
        }

        _, err = ReadExperimentFile("./not_exist_file.yaml")
        if err == nil {
            t.Errorf("Expected error for file does not exist, got nil")
        }
    })
}

func isInvalidFilename(filename string) bool{
	return strings.IndexByte(filename, 0) != -1 || filename == "" || filename == "." || filename == ".." || filename == "/" || len(filename) > 255
}

func isInvalidYAML(data []byte) bool{
	for _, b := range data {
        if b < 32 || b == 127 {
            return true
        }
    }
    return false
}