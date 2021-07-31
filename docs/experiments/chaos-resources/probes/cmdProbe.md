## Command Probe

The command probe allows developers to run shell commands and match the resulting output as part of the entry/exit criteria. The intent behind this probe was to allow users to implement a non-standard & imperative way of expressing their hypothesis. For example, the cmdProbe enables you to check for specific data within a database, parse the value out of a JSON blob being dumped into a certain path, or check for the existence of a particular string in the service logs.
It can be executed by setting `type` as `cmdProbe` inside `.spec.experiments[].spec.probe`.

### Inline Mode

In inline mode, the command probe is executed from within the experiment image. It is preferred for simple shell commands.
It can be tuned by setting `source` as `inline`.

Use the following example to tune this:
<references to the sample manifest>

### Source Mode

In source mode, the command execution is carried out from within a new pod whose image can be specified. It can be used when application-specific binaries are required.
It can be tuned by setting `source` as `<source-image>`.

Use the following example to tune this:
<references to the sample manifest>