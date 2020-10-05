# Litmus Portal development environment setup for Okteto cloud

This directory contains setup guide to start developing Litmus Portal on Okteto cloud. 


## Prerequisites

- Install `kubectl` for `kubernetes` from [here](https://kubernetes.io/docs/tasks/tools/install-kubectl)

- Fork the repository [litmuschaos/litmus](https://github.com/litmuschaos/litmus)

- Clone your forked version of [litmuschaos/litmus](https://github.com/litmuschaos/litmus) locally.

  ```bash
  git clone https://github.com/<GitHub username>/litmus.git
  ```

- Change to `litmus` directory and branch out from `master` to a `dev` branch on your fork.

  ```bash
  cd litmus
  git checkout -b dev
  ```

- Change to `okteto-dev-env-setup` directory.

  ```bash
  cd litmus-portal/okteto-dev-env-setup
  ```


## Instructions

- <h4>STEP-1:</h4> Export your GitHub username to an environment variable.

  ```bash
  OKTETO_NAMESPACE="<GitHub username>"
  ```

- <h4>STEP-2:</h4> Obtain the Litmus Portal development manifest using the given template.

  ```bash
  sed s/%OKTETO_NAMESPACE%/$OKTETO_NAMESPACE/g litmus-portal-dev-manifest-template.yml > env/litmus-portal-dev-manifest.yml
  ```

- <h4>STEP-3:</h4> Update this readme file by replacing the `%GITHUB_USERNAME%` variable in STEP-6 using the given command.

  ```bash
  sed s/%GITHUB_USERNAME%/$OKTETO_NAMESPACE/g README.md > env/README.md
  ```

- <h4>STEP-4:</h4> Go to the root folder of this cloned repository i.e. `litmus` then add, commit and push these changes to your GitHub.

  ```bash
  cd ../..
  git add .
  git commit -s -m "Obtained development manifest and updated README"
  git push --set-upstream origin dev
  ```

- <h4>STEP-5:</h4> Install Okteto CLI
  
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

- <h4>STEP-6:</h4> Click the `Develop on Okteto` button on `env` folder's `README.md` from GitHub UI to deploy litmus-portal on Okteto cloud and start developing.
  
  [![Develop on Okteto](https://okteto.com/develop-okteto.svg)](https://cloud.okteto.com/deploy?repository=https://github.com/%GITHUB_USERNAME%/litmus&branch=dev)

- <h4>STEP-7:</h4> Download and export the kubeconfig file from Okteto cloud settings page into `KUBECONFIG` environment variable and Login to Okteto cloud using the CLI.

  ```bash
  export KUBECONFIG=$HOME/Downloads/okteto-kube.config:${KUBECONFIG:-$HOME/.kube/config}
  okteto login
  ```

- <h4>STEP-8:</h4> Go to specific component folders i.e. authentication, cluster-agents/subscriber, graphql-server, tools/self-deployer or frontend of `litmus-portal` folder and then run `okteto up` before manking changes to the code.

  ```bash
  cd litmus-portal/frontend
  okteto up
  ```

- <h4>STEP-9:</h4> Start the selected component's service on its container to start developing and get the changes reflected on deployed litmus-portal component which can be accessed from Okteto UI or from `https://<service name>-<okteto-namespace>.cloud.okteto.net`. This may take several minutes to start running inside the docker container. Add the given `if block` after changing `<okteto-namespace>` with your GitHub username to `litmus-portal/frontend/src/config/index.ts` file just before the `export default` statement. Then enter username as `admin` and password as `litmus` to login from the UI.

  > `<okteto-namespace>`:litmusportal-frontend app>
  ```bash
  npm install && npm audit fix && cd src && npm start
  ```

  > Add the given `if block` after changing `<okteto-namespace>` with your GitHub username to `litmus-portal/frontend/src/config/index.ts` file just before the `export default` statement. <h5>Must be done before login.</h5>
  ```js
  if (loc.href.includes('cloud.okteto.net')) {
    authURL =
      'https://litmusportal-production-frontend-service-<okteto-namespace>.cloud.okteto.net/auth';
    apiURL =
      'https://litmusportal-production-frontend-service-<okteto-namespace>.cloud.okteto.net/api';
    sockURL = `wss://litmusportal-production-frontend-service-<okteto-namespace>.cloud.okteto.net/ws`;
  }
  ```

  > login as default user with username as `admin` and password as `litmus` 

- <h4>STEP-10:</h4> After you are done with the code changes, you may stop the development environment using `okteto down` and go to the `okteto-dev-env-setup` directory of the cloned repository, delete the  `env` folder contents, delete the `if block` which was added for okteto dev env setup from `litmus-portal/frontend/src/config/index.ts` file and then enter the root directory of the cloned repository i.e. `litmus` and push the changes to your forked repository.

  >
  ```bash
  okteto down
  cd ../okteto-dev-env-setup
  rm -v env/*
  ```
  
  >
  ```bash
  cd ../frontend/src/config
  ```
  
  > Delete the added `if block` for okteto env setup from `index.ts` file.

  >
  ```bash
  cd ../../../..
  git add .
  git commit -s -m "Updated frontend component and dev-manifest deleted."
  git push --set-upstream origin dev
  ```

- <h4>STEP-11:</h4> Raise a pull request from the `dev` branch in your fork to [litmuschaos/litmus](https://github.com/litmuschaos/litmus) after deleting the generated development manifest file `litmus-portal-dev-manifest.yml` in `litmus-portal/okteto-dev-env-setup` folder of `litmus` repository and pushing the changes.


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


## Optional

- To compare the changes made during development phase with the actual production code you can visit `https://litmusportal-production-frontend-service-<okteto-namespace>.cloud.okteto.net` after replacing `<okteto-namespace>` with your GitHub username.
