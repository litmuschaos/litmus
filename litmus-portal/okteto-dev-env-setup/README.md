# Litmus Portal Development Environment Setup for Okteto cloud

This directory contains setup guide to start developing Litmus Portal on Okteto cloud. 


## Prerequisites 

- Fork the repository [litmuschaos/litmus](https://github.com/litmuschaos/litmus)

- Clone your forked version of [litmuschaos/litmus](https://github.com/litmuschaos/litmus) locally.

  ```
  git clone https://github.com/<GitHub username>/litmus.git
  ```

- Change to `litmus` directory and branch out from `master` to a `dev` branch on your fork.

  ```
  cd litmus
  git checkout -b dev
  ```

- Change to `okteto-dev-env-setup` directory.

  ```
  cd litmus-portal/okteto-dev-env-setup
  ```


## Instructions

- STEP-1: Export your GitHub username to an environment variable.

  ```
  OKTETO_NAMESPACE="<GitHub username>"
  ```

- STEP-2: Obtain the Litmus Portal development manifest using the given template.

  ```
  sed s/%OKTETO_NAMESPACE%/$OKTETO_NAMESPACE/g litmus-portal-dev-manifest-template.yml > env/litmus-portal-dev-manifest.yml
  ```

- STEP-3: Update this readme file by replacing the `%GITHUB_USERNAME%` variable in STEP-6 using the given command.

  ```
  sed s/%GITHUB_USERNAME%/$OKTETO_NAMESPACE/g README.md > env/README.md
  ```

- STEP-4: Go to the root folder of this cloned repository i.e. `litmus` then add, commit and push these changes to your GitHub.

  ```
  cd ../..
  git add .
  git commit -s -m "Obtained development manifest and updated README"
  git push --set-upstream origin dev
  ```

- STEP-5: Install Okteto CLI
  
  For MAC/Linux:

  ```
  curl https://get.okteto.com -sSfL | sh
  ```

  or

  ```
  brew install okteto
  ```

  For Windows:

  Download the binary executable from [here](https://downloads.okteto.com/cli/okteto.exe) and add it to your `$PATH` environment variable.

- STEP-6: Click the `Develop Litmus Portal on Okteto` button on `env` folder's `README.md` from GitHub UI to deploy litmus-portal on Okteto cloud and start developing.
  
  [![Develop Litmus Portal on Okteto](https://okteto.com/develop-okteto.svg)](https://cloud.okteto.com/deploy?repository=https://github.com/%GITHUB_USERNAME%/litmus&branch=dev)

- STEP-7: Download and export the kubeconfig file from Okteto cloud into `KUBECONFIG` environment variable and Login to Okteto cloud using the CLI.

  ```
  export KUBECONFIG=$HOME/Downloads/okteto-kube.config:${KUBECONFIG:-$HOME/.kube/config}
  okteto login
  ```

- STEP-8: Go to specific component folders i.e. authentication, cluster-agents/subscriber, graphql-server, tools/self-deployer or frontend of `litmus-portal` folder and then run `okteto init` and `okteto up` before manking changes to the code.

  ```
  cd litmus-portal/frontend
  okteto up
  ```

- STEP-9: Run okteto build and push after making the code changes to get them reflected on deployed litmus-portal component.

  ```
  okteto build -t okteto.dev/litmusportal-frontend:dev .
  okteto push --name frontend -t $OKTETO_NAMESPACE/litmusportal-frontend:dev
  ```

- STEP-10: Stop development environment using `okteto down` and go to the `okteto-dev-env-setup` directory of the cloned repository, delete the  `env` folder contents and then enter the root directory of the cloned repository i.e. `litmus` and push the changes to your forked repository.

  ```
  okteto down
  cd ../okteto-dev-env-setup
  rm -v env/*
  cd ../..
  git add .
  git commit -s -m "Updated frontend component and dev-manifest deleted."
  git push --set-upstream origin dev
  ```

- STEP-11: Raise a pull request from the `dev` branch in your fork to [litmuschaos/litmus](https://github.com/litmuschaos/litmus) after deleting the generated development manifest file `litmus-portal-dev-manifest.yml` in `litmus-portal/okteto-dev-env-setup` folder of `litmus` repository and pushing the changes.
