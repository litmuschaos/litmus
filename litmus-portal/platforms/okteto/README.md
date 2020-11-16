# Litmus Portal development environment setup for Okteto cloud

This directory contains setup guide to start developing Litmus Portal on Okteto cloud. 


## Prerequisites

- Install `kubectl` for `kubernetes` from [here](https://kubernetes.io/docs/tasks/tools/install-kubectl)

- Create an Okteto cloud account and install the Okteto CLI from [here](https://okteto.com)
  
  For MAC/Linux:

  ```bash
  curl https://get.okteto.com -sSfL | sh
  ```

  or

  ```bash
  brew install okteto
  ```

  For Windows:

  Download the binary executable from [here](https://downloads.okteto.com/cli/okteto.exe) and add it to your `$PATH` environment variable.

- Fork the repository [litmuschaos/litmus](https://github.com/litmuschaos/litmus)

- Create a new branch called `dev` from `master` using GitHub UI.

- Clone your forked version of [litmuschaos/litmus](https://github.com/litmuschaos/litmus) locally.

  ```bash
  git clone https://github.com/<GitHub username>/litmus.git
  ```

- Change to `litmus` directory and branch out from `master` to `dev` branch on your fork.

  ```bash
  cd litmus
  git checkout dev
  ```


## Instructions

- <h4>STEP-1:</h4> Switch to `dev` branch from GitHub UI and click the `Develop on Okteto` button below to deploy litmus-portal on Okteto cloud and start developing.
  
  [![Develop on Okteto](https://okteto.com/develop-okteto.svg)](https://cloud.okteto.com/deploy)

- <h4>STEP-2:</h4> Login to Okteto cloud using the CLI to download your kubernetes credentials.

  ```bash
  okteto login
  okteto namespace
  ```

- <h4>STEP-3:</h4> Go to specific component folders i.e. `authentication`, `cluster-agents/subscriber`, `graphql-server`, `tools/self-deployer` or `frontend` of `litmus-portal` folder and then run `okteto up` before making changes to the code.

  ```bash
  cd litmus-portal/frontend
  okteto up
  ```

- <h4>STEP-4:</h4> Start the selected component's service on its container to start developing and get the changes reflected on deployed litmus-portal component which can be accessed from Okteto UI or from `https://<service name>-<okteto-namespace>.cloud.okteto.net`. This may take several minutes to start running inside the docker container. Add the given `if block` after changing `<okteto-namespace>` with your GitHub username to `litmus-portal/frontend/src/config/index.ts` file just before the `export default` statement. Then enter username as `admin` and password as `litmus` to login from the UI.

  > `<okteto-namespace>`:litmusportal-frontend app>
  ```bash
  npm install && npm audit fix && cd src && npm start
  ```

  > Use your IDE or code editor to add the given `if block` after changing `<okteto-namespace>` with your GitHub username to `litmus-portal/frontend/src/config/index.ts` file just before the `export default` statement. <h5>Must be done before login.</h5>
  ```js
  if (loc.href.includes('cloud.okteto.net')) {
    authURL =
      'https://litmusportal-production-frontend-service-<okteto-namespace>.cloud.okteto.net/auth';
    apiURL =
      'https://litmusportal-production-frontend-service-<okteto-namespace>.cloud.okteto.net/api';
    sockURL = `wss://litmusportal-production-frontend-service-<okteto-namespace>.cloud.okteto.net/ws`;
  }
  ```

  > login as default user with username as `admin` and password as `litmus` from the browser via `https://litmusportal-frontend-service-<okteto-namespace>.cloud.okteto.net` replacing `<okteto-namespace>` with your GitHub username.

- <h4>STEP-5:</h4> Schedule a chaos workflow from frontend selecting `namespaced-scope-chaos` from predefined workflow templates. Also replace the `adminModeNamespace` parameter's value field `litmus` with your GitHub username using the Yaml editor while scheduling. Now, you can start developing.

- <h4>STEP-6:</h4> After you are done with the code changes, you may stop the development environment using `okteto down` and go to the `litmus-portal/frontend/src/config` directory of the cloned repository on `dev` branch from IDE or code editor and delete the `if block` which was added for okteto dev env setup from `index.ts` file. Then change to the root directory of the cloned repository i.e. `litmus` and push the changes to your fork's `dev` branch.

  > Exit the process and the container. Stop it using the given commands in sequence.
  ```bash
  exit && exit
  okteto down
  ```
  
  > Go to `litmus-portal/frontend/src/config` directory of the clone from your IDE or code editor and delete the added `if block` for okteto env setup from `index.ts` file.

  > Change to the root directory of the cloned repository i.e. `litmus` and push the changes to your fork's `dev` branch.
  ```bash
  cd ../..
  git add .
  git commit -s -m "Updated frontend component and reverted dev env changes."
  git push --set-upstream origin dev
  ```

- <h4>STEP-7:</h4> Raise a pull request from the `dev` branch in your fork to https://github.com/litmuschaos/litmus using GitHub UI after pushing all the changes.


## Debugging

- Delete all configmaps after cleaning up your Okteto cloud namespace or deleting Litmus Portal components.

  ```bash
  kubectl delete cm --all
  ```

- Export kubeconfig file to `KUBECONFIG` environment variable when `deployment for labels <label> not found` or `No resources found`.

  ```bash
  export KUBECONFIG=$HOME/Downloads/okteto-kube.config:${KUBECONFIG:-$HOME/.kube/config}
  ```

- To check the status of all the `pods` in your Okteto cloud `namespace`.

  ```bash
  kubectl get pods
  ```

- If `No cluster is registered with the selected projectID` message is displayed, select a project from header's project list dropdown.


## Optional

- To compare the changes made during development phase with the actual production code you can visit `https://litmusportal-production-frontend-service-<okteto-namespace>.cloud.okteto.net` after replacing `<okteto-namespace>` with your GitHub username.
