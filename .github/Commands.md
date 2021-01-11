# On-demand E2E Tests Commands

### Here are the different commands that can be used for triggering Tests using github-actions:

<table>
  <tr>
    <th>Commands</th>
    <th>Description</th>
    <th>Time Taken</th>
  </tr>
  <tr>
    <td>/run-unit</td>
    <td>This command is used for executing all unit tests using Cypress.</td>
    <td>Moderate</td>
  </tr>
  <tr>
    <td>/run-e2e-AuthTests</td>
    <td>This Command is used for executing all Auth-Related e2e-tests (Login and Welcome Modal functionalities) using Cypress by building and deploying the respective PR in a KinD Cluster.</td>
    <td>Depends on Changes in the PR ( If changes are done in frontend, It can take more than 11 mins.), moderate in other cases.</td>
  </tr>
  <tr>
    <td>/run-e2e-Settings</td>
    <td>This Command is used for executing all Settings and Teaming Related e2e-tests using Cypress by building and deploying the respective PR in a KinD Cluster.</td>
    <td>Depends on Changes in the PR ( If changes are done in frontend, It can take more than 11 mins.), moderate in other cases.</td>
  </tr>
  <tr>
    <td>/run-e2e-all</td>
    <td>This Command is used for executing all e2e-tests using Cypress by building and deploying the respective PR in a KinD Cluster.</td>
    <td>Depends on Changes in the PR ( If changes are done in frontend, It can take more than 11 mins.), moderate in other cases.</td>
  </tr>
</table>
