## Steps to Contribute

Fixes and improvements can be directly addressed by sending a Pull Request on GitHub. Pull requests will be reviewed by one or more maintainers and merged when acceptable.

We ask that before contributing, please make the effort to coordinate with the maintainers of the project before submitting large or high impact PRs. This will prevent you from doing extra work that may or may not be merged.

Use your judgement about what constitutes a large change. If you aren't sure, send a message to the **#litmus-dev** slack or submit an issue on GitHub.

<br />

### **Sign your work with Developer Certificate of Origin**

To contribute to this project, you must agree to the Developer Certificate of Origin (DCO) for each commit you make. The DCO is a simple statement that you, as a contributor, have the legal right to make the contribution.

See the [DCO](https://developercertificate.org/) file for the full text of what you must agree to.

To successfully sign off your contribution you just add a line to every git commit message:

```git
Signed-off-by: Joe Smith <joe.smith@email.com>
```

Use your real name (sorry, no pseudonyms or anonymous contributions.)

If you set your `user.name` and `user.email` git configs, you can sign your commit automatically with `git commit -s`. You can also use git [aliases](https://git-scm.com/book/tr/v2/Git-Basics-Git-Aliases) like `git config --global alias.ci 'commit -s'`. Now you can commit with git ci and the commit will be signed.

<br />

### **Version Upgrade File**

## Versions

`<version>/` folder contains files for the upgrade logic

- `upgrade-manager.go` - Contains a map of versions with their corresponding version-managers for the versions.
- `vx.y.z/manager.go` - Instantiates the Version Manager and runs the upgradeExecutor.
- `vx.y.z/upgrade.go` - Contains the logic of upgradeExecutor of what schema changes are to be made in the specific version.

There are some other files not mentioned here.