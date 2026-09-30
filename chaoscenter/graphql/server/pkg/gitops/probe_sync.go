package gitops

import (
	"context"
	"errors"
	"fmt"
	"path/filepath"
	"strings"

	log "github.com/sirupsen/logrus"
)

// operationContext bounds a database operation issued by the sync loop.
// SyncDBToGit is called with a nil context from the periodic sync, so the
// parent is optional.
func operationContext(parent context.Context) (context.Context, context.CancelFunc) {
	if parent == nil {
		parent = backgroundContext
	}
	return context.WithTimeout(parent, timeout)
}

// resourceNameFromFile derives the resource name from a manifest path. Both
// experiments and probes are stored in git as <name>.yaml.
func resourceNameFromFile(file string) string {
	_, fileName := filepath.Split(file)
	return strings.TrimSuffix(fileName, ".yaml")
}

// syncProbe creates or updates the probe described by a ResilienceProbe
// manifest that was added or changed in git.
func (g *gitOpsService) syncProbe(ctx context.Context, data []byte, file string, config GitConfig) error {
	probe, err := parseProbeManifest(data)
	if err != nil {
		return err
	}
	if name := resourceNameFromFile(file); name != probe.Name {
		return fmt.Errorf("file name %q doesn't match probe name %q", name, probe.Name)
	}

	opCtx, cancel := operationContext(ctx)
	defer cancel()

	isNew, err := g.probeService.ValidateUniqueProbe(opCtx, probe.Name, config.ProjectID)
	if err != nil {
		return fmt.Errorf("failed to look up probe: %w", err)
	}
	if isNew {
		log.Info("Creating probe from git : ", probe.Name)
		_, err = g.probeService.AddProbe(opCtx, *probe, config.ProjectID, gitOpsUsername)
		return err
	}
	log.Info("Updating probe from git : ", probe.Name)
	_, err = g.probeService.UpdateProbe(opCtx, *probe, config.ProjectID, gitOpsUsername)
	return err
}

// deleteProbe removes the probe whose manifest was deleted from git.
func (g *gitOpsService) deleteProbe(ctx context.Context, file string, config GitConfig) error {
	name := resourceNameFromFile(file)

	opCtx, cancel := operationContext(ctx)
	defer cancel()

	isMissing, err := g.probeService.ValidateUniqueProbe(opCtx, name, config.ProjectID)
	if err != nil {
		return fmt.Errorf("failed to look up probe: %w", err)
	}
	if isMissing {
		log.Info("Probe already absent, nothing to delete : ", name)
		return nil
	}
	log.Info("Deleting probe from git : ", name)
	_, err = g.probeService.DeleteProbe(opCtx, name, config.ProjectID, gitOpsUsername)
	return err
}

// deletedFileKind returns the lowercase kind of a manifest that no longer
// exists in the working tree, read from the last commit that contained it.
// The kind decides whether the deletion removes an experiment or a probe;
// the file path cannot tell, because probes may live in any directory.
func deletedFileKind(file string, config GitConfig) (string, error) {
	data, err := config.LastCommittedContent(file)
	if err != nil {
		return "", err
	}
	kind, err := manifestKind(data)
	if err != nil {
		return "", err
	}
	if kind == "" {
		return "", errors.New("manifest has no kind")
	}
	return kind, nil
}
