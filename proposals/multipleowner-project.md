| title | authors                                  | creation-date | last-updated |
|-------|------------------------------------------|---------------|--------------|
| Multiple owners feature | [@AryanBhokare](https://github.com/aryan-bhokare) | | |

## Summary

This proposal is for adding the multiple owners feature in the project management of litmus. Giving users a functionality to keep multiple owners in their project and decoupling the user creation and project creation.

### Goals

- Users can be invited with the role owner.
- There can be multiple owners in one project.
- Users can be created without any projects.
- Users can create multiple projects.

## Proposal

### Flow Diagram
![Flow](multipleprojectwoner.png)

### Implementation Details

The proposal suggests decoupling user login and project creation. We are going to support multiple owners and add APIs `Delete Project`: to delete the projects, `Update Role`: to update role of the user in the project. We will also support multiple projects under one user.
