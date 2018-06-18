### Setting up local disk resources

- Manually discover, format and mount the disk on desired node
- Update templates/pv.yaml with appropriate node and disk mount location

#### Note: 

- The local PV is beta in Kubernetes 1.10. 
- The standard PersistentVolumeReclaim policy is "Retain", "Delete" is yet to be supported in all types of clusters


