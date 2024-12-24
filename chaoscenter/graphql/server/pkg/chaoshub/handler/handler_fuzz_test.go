package handler

import (
	"archive/zip"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
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

func FuzzGetExperimentData(f *testing.F) {
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

		jsonContent, _ := json.Marshal(content)
		err = os.WriteFile(filePath, jsonContent, 0644)
		if err != nil {
			t.Fatal(err)
		}

		_, err = GetExperimentData(filePath)

		if err != nil && !isInvalidYAML(jsonContent) && json.Valid(jsonContent) {
			t.Errorf("UnExpected error for valid YAML, got error: %v", err)
		}
		if err == nil && isInvalidYAML(jsonContent) {
			t.Errorf("Expected error for invalid YAML, got nil")
		}

		_, err = ReadExperimentFile("./not_exist_file.yaml")
		if err == nil {
			t.Errorf("Expected error for file does not exist, got nil")
		}
	})
}

func FuzzReadExperimentYAMLFile(f *testing.F) {
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

		jsonContent, _ := json.Marshal(content)
		err = os.WriteFile(filePath, jsonContent, 0644)
		if err != nil {
			t.Fatal(err)
		}

		_, err = ReadExperimentYAMLFile(filePath)

		if err != nil {
			t.Errorf("UnExpected error for valid YAML, got error: %v", err)
		}

		_, err = ReadExperimentFile("./not_exist_file.yaml")
		if err == nil {
			t.Errorf("Expected error for file does not exist, got nil")
		}
	})
}

func FuzzUnzipRemoteHub(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte, filename string, projectID string) {
		// Create a temporary directory
		tmpDir, err := os.MkdirTemp("", "*-fuzztest")
		if err != nil {
			t.Fatal(err)
		}
		defer os.RemoveAll(tmpDir) // clean up

		// Ensure the filename is valid and unique
		safeFilename := filepath.Clean(filepath.Base(filename))
		if isInvalidFilename(safeFilename) {
			safeFilename = "test.zip"
		}
		if !strings.HasSuffix(safeFilename, ".zip") {
			safeFilename += ".zip"
		}
		if isInvalidFilename(projectID) {
			projectID = uuid.New().String()
		}

		filePath := filepath.Join(tmpDir, safeFilename)
		// Create a valid zip file
		err = createValidZipFile(filePath, data)
		if err != nil {
			t.Fatal(err)
		}

		err = UnzipRemoteHub(filePath, projectID)

		if err != nil {
			t.Errorf("UnExpected error for valid zip, got error: %v", err)
		}

		// Test with non-existent file
		err = UnzipRemoteHub("./not_exist_file.zip", projectID)
		if err == nil {
			t.Errorf("Expected error for file does not exist, got nil")
		}

		// Test with non-zip file
		nonZipPath := filepath.Join(tmpDir, "no_zip")
		err = os.WriteFile(nonZipPath, []byte("not a zip file"), 0644)
		if err != nil {
			t.Fatal(err)
		}
		err = UnzipRemoteHub(nonZipPath, projectID)
		if err == nil {
			t.Errorf("Expected error for no zip, got nil")
		}
	})
}

func FuzzIsFileExisting(f *testing.F) {
	f.Fuzz(func(t *testing.T, filename string) {
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
		_, _ = os.Create(filePath)

		result, err := IsFileExisting(filePath)
		if !result {
			t.Errorf("Expected true for existing file, got false")
		}

		result, err = IsFileExisting("./not_exist_file.yaml")
		if result {
			t.Errorf("Expected false for not existing file, got true")
		}
	})
}

func isInvalidFilename(filename string) bool {
	return strings.IndexByte(filename, 0) != -1 || filename == "" || filename == "." || filename == ".." || filename == "/" || len(filename) > 255
}

func isInvalidYAML(data []byte) bool {
	for _, b := range data {
		if b < 32 || b == 127 {
			return true
		}
	}
	return false
}

func createValidZipFile(filename string, data []byte) error {
	zipFile, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	f, err := zipWriter.Create("test.txt")
	if err != nil {
		return err
	}
	_, err = f.Write(data)
	if err != nil {
		return err
	}

	return nil
}
