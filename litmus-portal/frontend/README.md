<h1 align="center">
  <img src="https://raw.githubusercontent.com/litmuschaos/website-litmuschaos/staging/src/images/LitmusLogo.png" alt="LitmusChaos" width="200">
</h1>

[![Slack Channel](https://img.shields.io/badge/Slack-Join-purple)](https://slack.litmuschaos.io)
[![CircleCI](https://circleci.com/gh/litmuschaos/litmus/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/litmuschaos/litmus)
[![Docker Pulls](https://img.shields.io/docker/pulls/litmuschaos/ansible-runner.svg)](https://hub.docker.com/r/litmuschaos/ansible-runner)
[![GitHub stars](https://img.shields.io/github/stars/litmuschaos/litmus?style=social)](https://github.com/litmuschaos/litmus/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/litmuschaos/litmus)](https://github.com/litmuschaos/litmus/issues)
[![Twitter Follow](https://img.shields.io/twitter/follow/litmuschaos?style=social)](https://twitter.com/LitmusChaos)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/3202/badge)](https://bestpractices.coreinfrastructure.org/projects/3202)
[![BCH compliance](https://bettercodehub.com/edge/badge/litmuschaos/litmus?branch=master)](https://bettercodehub.com/)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flitmuschaos%2Flitmus?ref=badge_shield)
[![YouTube Channel](https://img.shields.io/badge/YouTube-Subscribe-red)](https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw)
<br><br>

<img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpmcdeadline2.files.wordpress.com%2F2016%2F09%2Ftwitter-logo.jpg&f=1&nofb=1" alt="LitmusChaos Twitter" width="12"> (https://twitter.com/LitmusChaos/) **Follow us on Twitter!** [**@LitmusChaos**](https://twitter.com/LitmusChaos/)

<a href="https://litmuschaos.io"><img src="https://i.ibb.co/QKSMq9g/Screenshot-from-2020-09-14-18-54-05.png" align="right" width="250px" /></a>

## **Learn about Litmus** 😮😎

Litmus is a toolset to do cloud-native chaos engineering. Litmus provides tools to orchestrate chaos on Kubernetes to help SREs find weaknesses in their deployments. SREs use Litmus to run chaos experiments initially in the staging environment and eventually in production to find bugs, vulnerabilities. Fixing the weaknesses leads to increased resilience of the system.
<br><br>

## Table of Contents

1. [Project Structure Practices](#1-project-structure-practices)
2. [Available Scripts](#2-available-scripts)
3. [Tech Stack](#3-tech-stack)
4. [Frontend Contribution Guidelines](#4-frontend-contribution-guidelines)
5. [Error Handling Practices](#5-error-handling-practices)
6. [Testing And Overall Quality Practices](#6-testing-and-overall-quality-practices)
7. [Project Structure Practices](#7-project-structure-practices)
8. [Coding Style Guide](#8-coding-style-guide)
9. [User Guide for Litmus Portal](#9-user-guide-for-litmus-portal)
   <br><br><br>

### `1. Project Structure Practices`

<br>

```
frontend
├── 📁 cypress
│   ├── 📁 components
├── 📁 src
│   ├── 📁 components
│   ├── 📁 config
│   ├── 📁 container
│   │   ├── 📁 app
│   │   ├── 📁 layout
│   ├── 📁 graphql
|   │   ├── 📁 graphql
|   │   ├── 📁 redux
│   ├── 📁 models
│   ├── 📁 pages
│   ├── 📁 redux
│   ├── 📁 svg
│   ├── 📁 testHelpers
│   ├── 📁 theme
│   ├── 📁 utils
│   ├── 📁 views
│   │   ├── 📁 <page-name>
|   │   │   ├── 📁 <page-components>
│   ├── 📃i18n.js
│   ├── 📃index.tsx
│   ├── 📃ReduxRoot.tsx
├── 📃.eslintrc.json
├── 📃.prettierrc.json
├── 📃cypress.json
├── 📃Dockerfile
├── 📃package.json
├── 📃Readme.md
├── 📃tsconfig.json
├── 📃tsconfig.prod.json
├── 📃tsconfig.test.json
```

<br>

### `2. Available Scripts`

<br>

In the project directory, you can run:

#### 🐱‍💻 **Run dev server**

```
npm start
```

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload if you make edits.<br>
You will also see any lint errors in the console.
<br><br>

#### 🔴 **Run unit tests**

```
npm test
```

Runs unit tests in cypress. You can do a `npx cypress open` to launch this in interactive mode in the browser.
Cypress records a video for each spec file when running tests during `cypress run`. Videos are not automatically recorded during `cypress open`.
Video recording can be turned off entirely by setting `video` to `false` from within your configuration.

```
npm run unit:ci
```

<br>

#### 🛠️ **Build the project**

```
npm run build
```

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.

<br>

#### 🏴🏴‍☠️ **Lint your code**

```
npm run lint
```

ESLint statically analyzes your code to quickly find problems.<br>
You would be able to see any lint errors in the console based on the rules set on `.eslintrc`

<br>

#### ♻️ **Format your Code**

```
npm run format
```

Formats your document according to the prettier guidelines and then does a `eslint --fix`
Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.
`Prettier` for formatting and `linters` for catching bugs! 🐛
<br><br>

### `3. Tech Stack`

<br>

<img src = 'https://image.flaticon.com/icons/svg/919/919853.svg' width='30'/> <img src = 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.codeproject.com%2FKB%2FHTML%2F843860%2FTypeScript.png&f=1&nofb=1' width='30'/> <img src = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.volaresystems.com%2FImages%2FPosts%2F2019%2F12%2Feslint_logo_text.png&f=1&nofb=1' width='30'/> <img src = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ffaridoon.com%2Fwp-content%2Fuploads%2F2019%2F08%2FMaterialUILogo.png&f=1&nofb=1' width='30'/> <img src = 'https://image.flaticon.com/icons/svg/919/919851.svg' width='30'/> <img src = 'https://image.flaticon.com/icons/svg/919/919856.svg' width='30'/> <img src = 'https://upload-icon.s3.us-east-2.amazonaws.com/uploads/icons/png/3556671901536211770-512.png' width='30'/> <img src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/1200px-GraphQL_Logo.svg.png' width='30'/> <img src = 'https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/001/216/thumb/apollo-seeklogo.com_%281%29.png' width='30'/><img src = 'https://cdn.iconscout.com/icon/free/png-512/redux-283024.png' width='30'>
<br><br>

### `4. Frontend Contribution Guidelines`

<br>

We at Litmus always welcome a good frontend developer with open arms.<br>
Read our Contribution guidelines to get started quickly with our project 🗒️
<br><br>

### `5. Error Handling Practices`

<br>

[![Error Handling Badge](https://img.shields.io/badge/Error%20Handling-ESLint-red)](https://eslint.org/)

✋🛑 We try to make the developer experience easier and bug free by relying on certain tools maintain the code guidelines.

- `ESLint` and `Prettier` will help you keep the same code style as out project
- `Husky` and `Pre-commit` will ensure that all your code is properly formatted before you commit your code. Please do not skip this check, it'll help us accept your PRs faster.
  <br><br>

### `6. Testing And Overall Quality Practices`

<br>

[![Testing Badge](https://img.shields.io/badge/Testing-Cypress-yellowgreen)](https://github.com/bahmutov/cypress-react-unit-test)

Assign componentFolder to your preferred location for your tests. ⏳

```bash
{
    "experimentalComponentTesting": true,
    "componentFolder": "cypress/component",
    "specFiles": "*spec.*",
    "defaultCommandTimeout": 4000,
    "execTimeout": 200000,
    "taskTimeout": 200000
}
```

All the components which are having unit tests are present in `cypress/components` folder.
<br><br>

### `7. Project Structure Practices`

<br>

🏗️ The project structure is planned so that it is easier to to find the components necessary while coding. The various folders are explained below:

- **pages** 📁

  All such components that has a route associated with it will be part of this folder. eg "/home"

- **components** 📁

  Any global or shared components like input fields or buttons will be part of this folder.

- **views** 📁

  This folder house the various page components separated in different folders by the name of the page. This helps help find and organize your components.

- **containers/layout** 📁

  Reusable layout components are written in this folder.

- **theme** 📁

  This contains all theme related properties like colors, spacing etc.

- **redux** 📁

  All global state management files are in this redux folder.

- **graphql** 📁

  The schema for the queries, mutations and subscriptions are put in this folder.

- **models** 📁

  Global typescript interfaces and types that are put in this file.<br> It is separated in two folders one for redux models and one for graphql. The rest of the models are put directly in the folder.<br>
  **_NOTE: interfaces for component props are kept inside the index file of that component itself and only globally used models are put in models folder_**

- **public/locales** 📁

  This contains a language file which has all string constants used throughout the application. (_If you want to see litmus portal in your local language, we would love to have your contribution_)

- **svg** 📁

  SVG images that we import as React Components goes here.
  <br><br>

### `8. Coding Style Guide`

<br>

[![Airbnb Badge](https://img.shields.io/badge/Coding%20Style%20Guide-Airbnb-blue)](https://airbnb.io/javascript/react/)

This style guide is mostly based on the standards that are currently prevalent in JavaScript, although some conventions (i.e async/await or static class fields) may still be included or prohibited on a case-by-case basis. Currently, anything prior to stage 3 is not included nor recommended in this guide. 📟
We extend `ESLint` config to include `AirBnB` style guide.

<img src = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fyt3.ggpht.com%2F-QAiTwbM5sIA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2Fp2Z_6jWTxfU%2Fs900-c-k-no-mo-rj-c0xffffff%2Fphoto.jpg&f=1&nofb=1' width='30'/>

Rules we follow from `AirBnB` style guide:

1. Basic Rules
2. Functional Component
3. Naming
4. Declaration
5. Alignment
6. Quotes
7. Spacing
8. Props
9. Refs
10. Parentheses
11. Methods
12. Ordering
    Learn more about these rules [here](https://airbnb.io/javascript/react/)

<br><br>

### `9. User Guide for Litmus Portal`

<br>

Litmus-Portal provides console or UI experience for managing, monitoring, and events round chaos workflows. Chaos workflows consist of a sequence of experiments run together to achieve the objective of introducing some kind of fault into an application or the Kubernetes platform.

<br>

View the entire User Guide [here](https://docs.google.com/document/d/1fiN25BrZpvqg0UkBCuqQBE7Mx8BwDGC8ss2j2oXkZNA/edit#)

<br>

<h1 align="center">
    <img src = 'https://i.ibb.co/kXgQgX6/Image-from-i-OS-1.jpg' width='1000'/>
</h1>
