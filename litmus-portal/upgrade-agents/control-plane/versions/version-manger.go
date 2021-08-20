package versions

// IVersionManager is the interface for the Version Manager,
// a version manager is responsible to upgrade all the control plane components
// from the previous version to the current version,
// this includes any version related metadata stored in DB or configmaps
type IVersionManager interface {
	// Run executes all the steps required for the Version Manger
	// to upgrade from the previous version to `this` version
	Run() error
}
