package cluster

import (
	"bufio"
	"os"
	"strings"
)

//ManifestParser parses manifests yaml and generates dynamic manifest with specified keys
func ManifestParser(id, key, server, template string) ([]string, error) {
	file, err := os.Open(template)
	if err != nil {
		return []string{}, err
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
		return []string{}, err
	}
	return lines, nil
}
