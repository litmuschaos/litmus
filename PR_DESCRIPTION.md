# GitOps Sync for Resilience Probes - Feature Implementation

## 📋 Summary

This PR implements **GitOps Sync for Resilience Probes** (Feature Request #5465), enabling full declarative management of probes through Git repositories. Probes can now be defined as YAML manifests in a GitOps repository and automatically synchronized to ChaosCenter.

## 🎯 Feature Overview

### What's New

- ✅ **Declarative Probe Management**: Define probes as `ResilienceProbe` YAML manifests in Git
- ✅ **Automatic Synchronization**: Probes sync from Git → ChaosCenter every 2 minutes
- ✅ **Full CRUD Support**: Create, update, and delete operations handled automatically
- ✅ **All Probe Types Supported**: HTTP, CMD, Prometheus, and K8s probes
- ✅ **Idempotent Operations**: Safe to run sync multiple times
- ✅ **Validation & Error Handling**: Comprehensive validation with detailed error messages

### Scope

**In Scope:**
- ✅ Git Repository → ChaosCenter sync
- ✅ Probe detection and parsing from YAML manifests
- ✅ Create/Update/Delete operations via existing probe API
- ✅ Support for all probe types (HTTP, CMD, PROM, K8s)
- ✅ Validation and error handling
- ✅ Unit tests for sync logic
- ✅ Documentation and examples

**Out of Scope:**
- ❌ ChaosCenter → Git Repository sync (bidirectional GitOps)
- ❌ Non-Kubernetes infrastructure types

## 🏗️ Architecture & Design

### Design Principles

1. **Reuse Existing Patterns**: Follows the same GitOps sync pattern used for Chaos Experiments
2. **Minimal Changes**: Extends existing GitOps service without breaking changes
3. **Separation of Concerns**: Probe parsing logic is isolated and testable
4. **Idempotent**: Multiple syncs produce the same result

### Sync Flow

```
┌─────────────────┐
│  Git Repository │
│                 │
│  ResilienceProbe│
│  YAML Manifests │
└────────┬────────┘
         │
         │ GitOps Sync (every 2 min)
         │
         ▼
┌─────────────────┐
│  GitOps Service │
│                 │
│  - Detect files │
│  - Parse YAML   │
│  - Validate     │
└────────┬────────┘
         │
         │ Probe API
         │
         ▼
┌─────────────────┐
│  Probe Service  │
│                 │
│  - AddProbe     │
│  - UpdateProbe  │
│  - DeleteProbe  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MongoDB        │
│  ChaosCenter DB │
└─────────────────┘
```

## 📝 Changes Made

### Modified Files

#### 1. `chaoscenter/graphql/server/pkg/gitops/service.go`

**Changes:**
- Added probe service dependency to `gitOpsService` struct
- Updated `NewGitOpsService` constructor to accept `probeService` parameter
- Extended `SyncDBToGit` to detect and process `ResilienceProbe` manifests
- Added probe-specific sync logic to handle probe directory structure

**New Functions:**
- `syncProbe()` - Main probe sync orchestrator (create or update)
- `deleteProbe()` - Handles probe deletion from DB
- `parseProbeManifest()` - Converts YAML to ProbeRequest model
- `parseHTTPProbeProperties()` - Parses HTTP probe properties
- `parseCMDProbeProperties()` - Parses CMD probe properties
- `parsePromProbeProperties()` - Parses Prometheus probe properties
- `parseK8SProbeProperties()` - Parses K8s probe properties

**Key Logic:**
```go
// Detect ResilienceProbe kind
if kind == "resilienceprobe" {
    log.Info("Processing ResilienceProbe from git : " + file)
    err = g.syncProbe(ctx, string(data), file, config)
    if err != nil {
        log.Error("Error while syncing probe : " + file + " | " + err.Error())
        continue
    }
    continue
}
```

#### 2. `chaoscenter/graphql/server/graph/resolver.go`

**Changes:**
- Updated `NewGitOpsService` call to include `probeService` parameter

**Before:**
```go
gitOpsService := gitops3.NewGitOpsService(gitopsOperator, chaosExperimentService, *chaosExperimentOperator)
```

**After:**
```go
gitOpsService := gitops3.NewGitOpsService(gitopsOperator, chaosExperimentService, *chaosExperimentOperator, probeService)
```

### New Files

#### 1. `chaoscenter/graphql/server/pkg/gitops/probe_sync_test.go`

**Purpose:** Comprehensive unit tests for probe sync functionality

**Test Coverage:**
- ✅ HTTP probe parsing (GET and POST methods)
- ✅ CMD probe parsing with comparator
- ✅ Prometheus probe parsing with query
- ✅ K8s probe parsing with selectors
- ✅ Invalid probe type handling
- ✅ Missing required fields validation
- ✅ Optional fields parsing
- ✅ Tags and description handling
- ✅ Error scenarios

**Test Count:** 15+ test cases covering all probe types and edge cases

#### 2. `examples/gitops/probes/*.yaml`

**Purpose:** Example probe manifests for each probe type

**Files:**
- `http-probe-example.yaml` - HTTP health check probe
- `cmd-probe-example.yaml` - Command execution probe
- `prom-probe-example.yaml` - Prometheus metrics probe
- `k8s-probe-example.yaml` - Kubernetes resource probe

#### 3. `docs/gitops-probe-sync.md`

**Purpose:** Comprehensive documentation for the feature

**Contents:**
- Overview and features
- Repository structure guidelines
- Probe manifest format specification
- Complete property reference for all probe types
- Step-by-step usage guide
- Best practices
- Troubleshooting guide
- Migration guide for existing probes

## 🔧 Technical Implementation Details

### Probe Manifest Format

All probes follow this structure:

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: <probe-name>
  description: "<description>"
  tags:
    - <tag1>
    - <tag2>
spec:
  type: <httpProbe|cmdProbe|promProbe|k8sProbe>
  infrastructureType: Kubernetes
  properties:
    # Type-specific properties
```

### Sync Logic

1. **Detection**: GitOps sync detects files with `.yaml` extension
2. **Kind Check**: Identifies `kind: ResilienceProbe` manifests
3. **Parsing**: Converts YAML to JSON, extracts properties
4. **Validation**: Validates required fields and probe type
5. **Uniqueness Check**: Determines if probe exists in DB
6. **Operation**: Creates new probe or updates existing one
7. **Error Handling**: Logs errors, continues with next file

### Idempotency

- Uses `ValidateUniqueProbe()` to check existence
- Creates if probe doesn't exist
- Updates if probe exists
- Same result regardless of how many times sync runs

### Error Handling

- File-level error isolation (one bad file doesn't stop sync)
- Detailed error logging with file path and error message
- Validation errors returned with clear messages
- Graceful handling of missing optional fields

## 🧪 Testing

### Unit Tests

**File:** `chaoscenter/graphql/server/pkg/gitops/probe_sync_test.go`

**Run Tests:**
```bash
cd chaoscenter/graphql/server
go test ./pkg/gitops -v -run TestParse
```

**Coverage:**
- Probe manifest parsing for all types
- Required field validation
- Optional field handling
- Error scenarios
- Edge cases (missing name, invalid type, etc.)

### Manual Testing

1. **Setup GitOps:**
   ```bash
   # Enable GitOps for a project via ChaosCenter UI
   # Configure Git repository with authentication
   ```

2. **Add Probe Manifest:**
   ```bash
   mkdir -p litmus/<project-id>/probes
   cp examples/gitops/probes/http-probe-example.yaml litmus/<project-id>/probes/
   git add .
   git commit -m "Add HTTP probe"
   git push
   ```

3. **Verify Sync:**
   ```bash
   # Wait 2 minutes for sync
   # Check ChaosCenter UI → Resilience Probes
   # Verify probe appears in list
   ```

4. **Update Probe:**
   ```bash
   # Edit probe YAML
   # Commit and push
   # Verify updates in ChaosCenter
   ```

5. **Delete Probe:**
   ```bash
   # Remove probe YAML file
   # Commit and push
   # Verify probe deleted from ChaosCenter
   ```

## 📊 Validation Results

### Syntax Validation

✅ All Go code passes `go fmt` and `go vet`
✅ No compilation errors
✅ Follows existing code style and patterns

### Functional Validation

✅ Probe detection works for all probe types
✅ Create operation successful
✅ Update operation successful
✅ Delete operation successful
✅ Error handling works correctly
✅ Logging provides useful information

### Integration Validation

✅ No breaking changes to existing GitOps functionality
✅ Experiment sync continues to work
✅ Probe service integration successful
✅ Database operations work correctly

## 📚 Documentation

### User Documentation

**File:** `docs/gitops-probe-sync.md`

**Sections:**
- Overview and features
- Repository structure
- Probe manifest format
- Property reference (all probe types)
- Usage guide (step-by-step)
- Best practices
- Troubleshooting
- Migration guide

### Code Documentation

- Inline comments for complex logic
- Function documentation for all new functions
- Clear variable naming
- Error messages with context

### Examples

**Directory:** `examples/gitops/probes/`

- HTTP probe example (GET and POST)
- CMD probe example with comparator
- Prometheus probe example with query
- K8s probe example with selectors

## 🔍 Code Review Checklist

### Functionality
- ✅ Feature works as specified in requirements
- ✅ All probe types supported (HTTP, CMD, PROM, K8s)
- ✅ Create, update, delete operations work
- ✅ Idempotent behavior verified
- ✅ Error handling comprehensive

### Code Quality
- ✅ Follows existing code patterns
- ✅ No code duplication
- ✅ Functions are focused and testable
- ✅ Error messages are clear and actionable
- ✅ Logging is appropriate and useful

### Testing
- ✅ Unit tests provided
- ✅ Test coverage is comprehensive
- ✅ Edge cases covered
- ✅ Manual testing performed

### Documentation
- ✅ User documentation complete
- ✅ Code comments added
- ✅ Examples provided
- ✅ Troubleshooting guide included

### Integration
- ✅ No breaking changes
- ✅ Backward compatible
- ✅ Existing tests still pass
- ✅ Dependencies properly managed

## 🚀 Deployment Notes

### Prerequisites

- GitOps must be enabled for the project
- Git repository must be configured with proper authentication
- Probe manifests must follow the specified format

### Migration Path

For users with existing probes:

1. Export probes from ChaosCenter UI
2. Convert to `ResilienceProbe` YAML format
3. Add to GitOps repository under `litmus/<project-id>/probes/`
4. Commit and push
5. Verify sync in ChaosCenter

### Rollback Plan

If issues occur:
1. Revert this PR
2. Existing probe functionality remains unchanged
3. No data loss (probes in DB are not affected)

## 📈 Performance Considerations

- **Sync Frequency:** 2 minutes (same as experiments)
- **File Processing:** Sequential, one file at a time
- **Error Isolation:** One bad file doesn't affect others
- **Database Operations:** Uses existing probe API (no new queries)
- **Memory Usage:** Minimal (processes one file at a time)

## 🔒 Security Considerations

- **Authentication:** Uses existing GitOps authentication
- **Authorization:** Uses existing probe API authorization
- **Validation:** All inputs validated before processing
- **Injection Prevention:** YAML parsing uses safe libraries
- **Error Messages:** Don't expose sensitive information

## 🐛 Known Limitations

1. **Bidirectional Sync:** ChaosCenter → Git sync not implemented (out of scope)
2. **Infrastructure Type:** Only Kubernetes supported currently
3. **File Naming:** File name must match probe name
4. **Sync Frequency:** Fixed at 2 minutes (not configurable)

## 📋 Future Enhancements

Potential improvements for future PRs:

1. **Bidirectional Sync:** Sync probes from ChaosCenter back to Git
2. **Configurable Sync Frequency:** Allow users to set sync interval
3. **Batch Operations:** Optimize sync for large numbers of probes
4. **Validation Webhooks:** Pre-commit validation for probe manifests
5. **Probe Templates:** Reusable probe templates in Git
6. **Multi-Infrastructure:** Support for non-Kubernetes infrastructures

## 🔗 Related Issues

- Closes #5465 - GitOps Sync for Resilience Probes

## 👥 Reviewers

Please review:
- [ ] Architecture and design approach
- [ ] Code quality and patterns
- [ ] Test coverage
- [ ] Documentation completeness
- [ ] Integration with existing code

## ✅ Checklist

- [x] Code follows project style guidelines
- [x] Self-review performed
- [x] Code commented where necessary
- [x] Documentation updated
- [x] No new warnings generated
- [x] Unit tests added
- [x] All tests pass locally
- [x] No breaking changes
- [x] Examples provided

## 📸 Screenshots

### Example Probe Manifest

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: http-health-check
  description: "HTTP probe to check application health"
  tags:
    - health-check
    - production
spec:
  type: httpProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: "5s"
    interval: "2s"
    url: "http://my-app:8080/health"
    method:
      get:
        criteria: "=="
        responseCode: "200"
```

### GitOps Repository Structure

```
my-gitops-repo/
├── litmus/
│   └── project-123/
│       ├── experiments/
│       │   ├── pod-delete.yaml
│       │   └── network-latency.yaml
│       └── probes/
│           ├── http-health-check.yaml
│           ├── cmd-status-check.yaml
│           ├── prom-cpu-check.yaml
│           └── k8s-deployment-check.yaml
```

## 🙏 Acknowledgments

- Feature request by community (#5465)
- Design follows existing LitmusChaos GitOps patterns
- Implementation maintains backward compatibility

---

**Ready for Review** ✨
