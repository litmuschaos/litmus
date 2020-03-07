## Ansible Playbook Custom Lint
These are custom ansible playbook lints to check to the litmus playbook
<table>
  <th>Code</th>
  <th>Name</th>
  <th>Description</th>
  <tr>
    <td>700</td>
    <td>Shell Module Scalar Rule</td>
    <td>Required scalar if shell commands are greater than three</td>
  </tr>
  <tr>
    <td>701</td>
    <td>Deprecated include module</td>
    <td>include module should be replace with (include_tasks/include_role/import_playbook/import_tasks)</td>
  </tr>
  <tr>
    <td>702</td>
    <td>Restricted commands Rule</td>
    <td>Certain commands like awk/cut/set should not be use</td>
  </tr>
   <tr>
    <td>703</td>
    <td>Ignore Errors check Rule</td>
    <td>Litmus Playbook does not recommend the use of ignore_errors</td>
  </tr>
</table>