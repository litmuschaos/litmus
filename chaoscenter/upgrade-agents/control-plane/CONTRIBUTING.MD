## Steps to Contribute

Fixes and improvements can be directly addressed by sending a Pull Request on GitHub. Pull requests will be reviewed by one or more maintainers and merged when acceptable.

We ask that before contributing, please make the effort to coordinate with the maintainers of the project before submitting large or high impact PRs. This will prevent you from doing extra work that may or may not be merged.

Use your judgement about what constitutes a large change. If you aren't sure, send a message to the **#litmus-dev** slack or submit an issue on GitHub.


### **Sign your work with Developer Certificate of Origin**

To contribute to this project, you must agree to the Developer Certificate of Origin (DCO) for each commit you make. The DCO is a simple statement that you, as a contributor, have the legal right to make the contribution.

See the [DCO](https://developercertificate.org/) file for the full text of what you must agree to.

To successfully sign off your contribution you just add a line to every git commit message:

```git
Signed-off-by: Joe Smith <joe.smith@email.com>
```

Use your real name (sorry, no pseudonyms or anonymous contributions.)

If you set your `user.name` and `user.email` git configs, you can sign your commit automatically with `git commit -s`. You can also use git [aliases](https://git-scm.com/book/tr/v2/Git-Basics-Git-Aliases) like `git config --global alias.ci 'commit -s'`. Now you can commit with git ci and the commit will be signed.

## **Development Guide**

Start MongoDB, Auth and GraphQL server as mentioned in the [ChaosCenter Development Guide](https://github.com/litmuschaos/litmus/wiki/ChaosCenter-Development-Guide) to set up the basic structure of the DB. Then start the upgrade manager located in `chaoscenter/upgrade-agents/control-plane` by setting up the environment variables

```
export DB_SERVER="mongodb://m1:27015,m2:27016,m3:27017/?replicaSet=rs0"
export DB_USER=admin
export DB_PASSWORD=1234
export VERSION=<Version you need to upgrade to>
```
To run the upgrade-manager, run

```
go run main.go
```
The upgrade-manager would get the current version of Litmus through the DB.

## **Version Upgrade Files**

`<version>/` folder contains files for the upgrade logic

- `upgrade-manager.go` - Contains a map of versions with their corresponding version-managers for the versions.
- `vx.y.z/manager.go` - Instantiates the Version Manager and runs the upgradeExecutor in transactions which can be omitted if the operation doesn't support a transaction.
- `vx.y.z/upgrade.go` - Contains the logic of upgradeExecutor of what schema changes are to be made in the specific version.

There are some other files not mentioned here.

## **Upgrade to version 3.9.0**

In version 3.9.0 the following changes are done in DB schema

- In projects collection (auth DB), member role is updated from `Editor` to `Executor`
- New `is_initial_login` field in users collection (auth DB) whose value is set as false

Run the upgrade-agent while specifying the version `VERSION=3.9.0` in the environmental variable, and it should now be upgraded.