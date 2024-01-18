| title | authors                                  | creation-date | last-updated |
|-------|------------------------------------------|---------------|--------------|
| Litmusctl Probe CRUD commmands | [@Nageshbansal](https://github.com/Nageshbansal) | 2024-01-04   | 2024-01-04|

## Summary

The Litmusctl probe commands can help developers create/list/delete the probes through the command line ( which can help them while they’re automating), as similar to chaos-center, a developer can save probes by going to the `Resilience Probe` tab.


### Goals

- Create, Describe, Delete, Update commands for Probe in Litmusctl
- Make `save chaos-experiment` command to list and use the Probes

## Proposal

### Commands

| Command    | Use Case |
| -------- | ------- |
| `save chaos-probe`  | this command allows to create a new probe, specifying details such as type, name, timeout, interval, retry, and polling interval.    |
| `delete chaos-probe` |  command allows developers to delete a probe by providing its name.     |
| `list chaos-probe`    |    displays a list of existing probes, including their names, IDs, types, and references. |
| `describe chaos-probe` | to view detailed information about a specific probe, providing its ID.|

### Implementation Details

The proposal suggests leveraging chaos-center's Probe GraphQL APIs to implement Litmusctl probe commands. Detailed information about probe properties, such as timeout, interval, retry, polling interval, URL, and method, will be captured during creation and displayed during listing and describing.




