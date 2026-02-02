## MongoDB Data Retention Strategy and Version Upgrade Plan

### 1. Problem Summary

- **Unbounded data growth**: The Litmus workflows and their associated results generate time-series style data (e.g., workflow runs, experiment executions, metrics, historical results). Without a defined retention policy, these collections grow continuously and can eventually impact MongoDB performance, storage costs, and backup/restore times.
- **No standard purge / retention mechanism**: There is currently no documented and automated mechanism to purge old workflow/result data while preserving recent, operationally useful information. This makes it hard for operators to manage storage proactively or to align with organization-specific retention requirements.
- **Outdated MongoDB version**: The project is currently running MongoDB **v6**, while the latest stable release line is **v8**. Long-term support, bug fixes, and performance improvements will increasingly target newer major versions.

This proposal defines:

- A **data retention strategy** based on MongoDB TTL indexes and, where needed, Kubernetes-native automation.
- A **stepwise MongoDB upgrade path** from v6 → v7 → v8 with clear guardrails for compatibility and validation.

> **Constraints**: The proposal assumes **no direct access to production credentials** and **no changes to application logic**. All recommendations are limited to design, configuration, and operational best practices that maintainers and operators can apply using existing deployment mechanisms.

---

### 2. Data Purge and Retention Strategy

#### 2.1. Identify Time-Based Collections Suitable for Cleanup

The aim is to retain only recent, operationally relevant workflow and result data, and safely purge older records. While exact collection names and schemas may differ per deployment, the following **categories** are typically safe candidates for time-based retention:

- **Workflow execution history**
  - Collections that store individual workflow runs / pipeline executions with timestamps (e.g., `workflows`, `workflow_runs`, `workflow_histories`).
  - Characteristics:
    - High write rate.
    - Data is mostly used for short-/medium-term observability, troubleshooting, and reporting.
    - Older entries (beyond a configured retention period) are rarely needed for normal operations.
- **Experiment / chaos run results**
  - Collections that store the verdicts, probes, and metadata for each experiment run (e.g., `chaos_results`, `experiment_results`).
  - Characteristics:
    - Similar time-series behavior: results are appended and seldom updated.
    - Historical data can be summarized elsewhere (e.g., metrics, external analytics) if long-term retention is needed.
- **Auxiliary runtime logs and events**
  - Collections capturing transient operational events (e.g., `events`, `audit_logs` specific to workflow executions, temporary debugging data).
  - Characteristics:
    - Valuable for troubleshooting but only within a bounded timeframe (e.g., 30–180 days).

**Action for maintainers/operators**:

- Document the **actual collection names** and their time-related fields (e.g., `createdAt`, `updatedAt`, `startedAt`, `finishedAt`) in deployment-specific docs.
- For each collection, decide an appropriate **retention period** (e.g., 30, 90, or 180 days) that balances:
  - Troubleshooting / audit needs
  - Compliance / governance requirements
  - Storage and performance constraints

This documentation can live alongside Helm chart values or operator configuration to make it easy for adopters to override defaults.

#### 2.2. Use MongoDB TTL Indexes as the Primary Solution

MongoDB supports **Time-To-Live (TTL) indexes**, which automatically delete documents after a specified interval based on a date field. This proposal recommends TTL indexes as the **primary mechanism** for data retention:

- **Characteristics of TTL indexes**:
  - Defined on a field of type `Date` (e.g., `createdAt`, `finishedAt`).
  - Configured with `expireAfterSeconds` to specify retention duration.
  - Deletions are handled in the background by MongoDB’s TTL monitor process, not by application code.

- **Why TTL indexes are a good fit**:
  - **No application code changes**: TTL policies are purely schema/index-level configuration and can be managed by DBAs or ops teams.
  - **Predictable storage behavior**: Collections automatically shed old data, keeping size within expected bounds.
  - **Low operational overhead**: Once configured, TTL indexes require minimal ongoing maintenance.
  - **Safe by design**: TTL deletions are based on explicit retention rules and date fields chosen by maintainers, making behavior auditable and reversible (by adjusting or temporarily disabling TTL).

**Recommended approach**:

- For each time-based collection:
  - Ensure there is a reliable **date field** indicating when the document became eligible for retention (e.g., `finishedAt` for runs, `createdAt` for logs).
  - Create a **single-field TTL index** on that date field with an `expireAfterSeconds` value matching the desired retention period.
- Manage TTL definitions:
  - Via **init containers**, DB migration jobs, or Kubernetes Job/CronJob manifests that can be applied as part of deployment.
  - Via **Helm hooks** or operator reconcile loops that ensure TTL indexes exist and match configured retention settings.

> **Note**: TTL indexes delete documents approximately based on the TTL monitor frequency (typically every ~60 seconds by default). They are not suitable for second-level precision but are ideal for day-level retention policies (e.g., 30, 90 days).

#### 2.3. Alternative: Kubernetes CronJobs for Manual Purging

In some environments, MongoDB TTL may be **undesirable or restricted**, for example:

- The schema lacks a suitable `Date` field and cannot be modified easily.
- There are complex retention rules (e.g., keep last N runs per workflow, retain records tied to compliance tags), which exceed simple time-based TTL.
- The MongoDB deployment is managed by a third-party service with limitations on index management.

For these cases, a **Kubernetes CronJob-based purge** is a viable alternative:

- **CronJob characteristics**:
  - Runs a container at scheduled intervals (e.g., daily) that connects to MongoDB and executes deletion queries.
  - Can be tailored to complex business rules, multiple collections, or one-off migrations.
  - Can emit logs/metrics about deletion activity for observability.

- **Design principles for CronJob-based purging**:
  - Use **read-only configuration** for connection details (ConfigMaps, Secrets) and avoid embedding any production credentials in source control.
  - Scope queries tightly to avoid unbounded deletes (e.g., delete in batches, limit documents per run).
  - Allow the CronJob manifest to be **optional / disabled by default** in Helm or Kustomize so adopters explicitly opt in.

> While CronJobs are more flexible, they also introduce more moving pieces (scripts, credentials, batch logic). Whenever feasible, prefer **TTL indexes** for simplicity and reduced maintenance.

#### 2.4. Why TTL Indexes Are Safe and Low-Maintenance in Kubernetes Environments

TTL indexes map well onto how Kubernetes workloads are managed:

- **Decoupled from application pods**:
  - TTL is enforced entirely within MongoDB, independent of the lifecycle of application pods or Kubernetes controllers.
  - Pod restarts, rollouts, or horizontal scaling do not affect retention behavior.
- **Declarative configuration**:
  - Index creation can be expressed as **Kubernetes manifests** or **Helm templates**, making retention rules part of the git-managed, declarative infrastructure.
  - Changes to TTL settings can follow the same review and rollout process as other infrastructure changes.
- **Predictable resource usage**:
  - Automatic deletions reduce the risk of sudden storage exhaustion that might otherwise cause pod evictions, PVC expansion, or node pressure.
  - Background TTL processing is incremental and designed to avoid large, blocking delete operations.
- **Easy to audit and adjust**:
  - Index definitions can be inspected (`db.collection.getIndexes()`), scripted, and version-controlled.
  - Operators can incrementally adjust retention (e.g., from 90 to 180 days) without any changes to application behavior.

---

### 3. MongoDB Version Upgrade Plan

#### 3.1. Why Direct Upgrade from v6 to v8 Is Unsafe

MongoDB does **not** support skipping major versions when performing in-place upgrades. A direct upgrade from **v6 → v8** is unsafe because:

- **Unsupported upgrade path**:
  - Official MongoDB documentation requires upgrading **one major version at a time** (e.g., 6.x → 7.x → 8.x), validating compatibility and completing internal migrations at each step.
  - Skipping directly from 6 to 8 can lead to data format incompatibilities, feature flag issues, and unsupported wire protocol versions.
- **Driver and feature incompatibilities**:
  - Application drivers and ODMs (e.g., Go, Node.js, Java drivers) typically declare compatibility for consecutive major versions.
  - Jumping multiple major versions increases risk of subtle behavior changes (e.g., query optimizer changes, index behavior, aggregation semantics).
- **Operational risk**:
  - The set of server parameters, deprecations, and defaults may change between each major release. Skipping intermediate versions skips their documented guidance, making rollback and troubleshooting more complex.

Therefore, the recommended and supportable upgrade path is **stepwise**: `6 → 7 → 8`.

#### 3.2. Proposed Stepwise Upgrade Path: 6 → 7 → 8

The following sequence is aligned with MongoDB best practices and avoids application-level changes:

1. **Pre-upgrade preparation (applies before each major jump)**
   - **Inventory and documentation**:
     - Confirm current MongoDB major/minor version (e.g., 6.0.x).
     - Identify deployment topology (single replica set, sharded cluster, storage engine, backing PVCs).
   - **Check compatibility documentation**:
     - Review official MongoDB release notes and compatibility notes for:
       - `6 → 7`
       - `7 → 8`
     - Pay special attention to:
       - Removed or deprecated features.
       - Changes in default server parameters.
       - Index format or feature flag changes.
   - **Backup and recovery plan**:
     - Ensure you have recent, tested backups or snapshots of the MongoDB data.
     - Document rollback procedures (e.g., restore from snapshot, downgrade strategy if supported).

2. **Upgrade from v6.x to v7.x**
   - **Staging environment dry run**:
     - Spin up a **staging cluster** using a copy of production-like data (via backup restore or sanitized snapshot).
     - Deploy the same application version and drivers used in production.
     - Perform a full cycle of workloads: workflow creation, execution, result retrieval, dashboard usage.
   - **Perform the upgrade in staging**:
     - Upgrade MongoDB components (container images, StatefulSet, or operator-managed CRs) to **v7.x** following official docs.
     - Allow the cluster to complete any internal migrations.
   - **Validate in staging**:
     - Monitor logs for deprecation warnings and errors.
     - Run application regression / smoke tests against the upgraded staging cluster.
   - **Production upgrade**:
     - Schedule a maintenance window if needed (depending on whether rolling upgrades are supported by the chosen topology).
     - Upgrade production MongoDB from 6.x to 7.x following the same steps as staging.
     - Monitor metrics (latency, error rate, disk I/O, CPU) and logs.

3. **Upgrade from v7.x to v8.x**
   - Repeat the **same process** as above:
     - Staging dry run with v8.x.
     - Review v8 release and compatibility notes.
     - Validate indexes, queries, and operational behaviors.
     - Apply the upgrade to production after successful staging validation.

4. **Post-upgrade validation and cleanup**
   - Verify:
     - All application components connect successfully without driver errors or deprecation warnings.
     - Background tasks (including TTL index deletions, if implemented) continue functioning as expected.
   - Update:
     - Project documentation to reflect the **new minimum supported MongoDB version** (v8 after completion).
     - Helm chart defaults and operator configuration to use v8 images.

#### 3.3. Driver Compatibility Checks and Staging Validation

Since no application logic changes are being proposed, ensuring **driver compatibility** is critical:

- **Driver version checks**:
  - For each service connecting to MongoDB, identify:
    - The programming language driver in use (e.g., Go driver, Node.js driver, Java driver).
    - The current driver version and its officially supported MongoDB server versions.
  - Confirm that driver versions are compatible with **MongoDB 7 and 8**. If not, schedule driver upgrades as part of normal dependency management (independent of this proposal’s scope but required before production rollout).

- **Staging validation objectives**:
  - **Connection and authentication**:
    - Ensure services can connect, authenticate, and perform CRUD operations as before.
  - **Query behavior and performance**:
    - Validate common queries and aggregations used by the application.
    - Compare latency and error rates pre- and post-upgrade.
  - **Background processes**:
    - Validate that TTL index deletions, scheduled jobs, and any batch processes behave identically or acceptably after each upgrade step.
  - **Schema and index integrity**:
    - Confirm that:
      - Collections and indexes are intact.
      - There are no unexpected index builds or drops.
      - Replica set or sharded cluster metadata is healthy.

Results from staging validation should be documented and linked from the repository (e.g., in `docs/operations/mongodb-upgrade-notes.md`) for future maintainers.

---

### 4. Benefits

By implementing the above retention and upgrade strategy, the project and its adopters gain the following benefits:

- **Controlled database growth**
  - Old workflow execution and result data are automatically purged based on clear, documented retention policies.
  - Storage utilization becomes predictable, reducing risk of unplanned outages due to disk exhaustion.
- **Reduced operational overhead**
  - TTL indexes eliminate the need for custom purge scripts and manual cleanups in most scenarios.
  - Operators can manage retention declaratively, alongside existing Kubernetes manifests and Helm values.
- **Safer, well-governed upgrades**
  - Stepwise 6 → 7 → 8 upgrades align with MongoDB’s supported paths and best practices.
  - Staging validations and driver compatibility checks reduce the risk of production incidents during upgrades.
- **Improved long-term maintainability**
  - Data lifecycle and database versioning are explicitly documented, making it easier for new maintainers and adopters to understand operational expectations.
  - Aligns the project with modern MongoDB capabilities (e.g., improved performance, security, and tooling) while keeping application logic untouched.

---

### 5. Next Steps for Maintainers

- **Short term**
  - Document the actual MongoDB collections and date fields used for workflows, results, and events.
  - Propose default retention periods (e.g., `chaos_results`: 90 days, workflow histories: 180 days) and surface them as configurable values in charts/manifests.
  - Design and document TTL index creation as part of deployment (init jobs, Helm hooks, or operator logic).
- **Medium term**
  - Plan and execute the MongoDB upgrade path in non-production, following the 6 → 7 → 8 steps.
  - Validate driver compatibility and adjust project documentation to reflect new minimum supported MongoDB version.
- **Long term**
  - Monitor retention behavior and database growth in real deployments, adjusting defaults based on feedback.
  - Keep upgrade documentation current with future MongoDB major releases to preserve a safe, repeatable upgrade path.

