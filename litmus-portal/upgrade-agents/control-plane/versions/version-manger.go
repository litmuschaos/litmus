package versions

// IVersionManager interface for the Version Manager,
// a version manager is responsible to upgrade all the control plane components
// from the previous version to the current version,
// this includes any version related metadata stored in DB or configmaps
type IVersionManager interface {
	Run() error
}