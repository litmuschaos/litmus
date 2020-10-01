Learn about Litmus 😮😎
Litmus is a toolset to do cloud-native chaos engineering. Litmus provides tools to orchestrate chaos on Kubernetes to help SREs find weaknesses in their deployments. SREs use Litmus to run chaos experiments initially in the staging environment and eventually in production to find bugs, vulnerabilities. Fixing the weaknesses leads to increased resilience of the system.


Table of Contents
Project Structure Practices
Available Scripts
Tech Stack
Frontend Contribution Guidelines
Error Handling Practices
Testing And Overall Quality Practices
Project Structure Practices
Coding Style Guide
User Guide for Litmus Portal


1. Project Structure Practices

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

2. Available Scripts

In the project directory, you can run:

🐱‍💻 Run dev server
npm start
Runs the app in the development mode.
Open http://localhost:3000 to view it in the browser. The page will reload if you make edits.
You will also see any lint errors in the console.


🔴 Run unit tests
npm test
Runs unit tests in cypress. You can do a npx cypress open to launch this in interactive mode in the browser. Cypress records a video for each spec file when running tests during cypress run. Videos are not automatically recorded during cypress open. Video recording can be turned off entirely by setting video to false from within your configuration.

npm run unit:ci

🛠️ Build the project
npm run build
Builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.


🏴🏴‍☠️ Lint your code
npm run lint
ESLint statically analyzes your code to quickly find problems.
You would be able to see any lint errors in the console based on the rules set on .eslintrc


♻️ Format your Code
npm run format
Formats your document according to the prettier guidelines and then does a eslint --fix Builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for the best performance. Prettier for formatting and linters for catching bugs! 🐛


3. Tech Stack

        


4. Frontend Contribution Guidelines

We at Litmus always welcome a good frontend developer with open arms.
Read our Contribution guidelines to get started quickly with our project 🗒️


5. Error Handling Practices

Error Handling Badge

✋🛑 We try to make the developer experience easier and bug free by relying on certain tools maintain the code guidelines.

ESLint and Prettier will help you keep the same code style as out project
Husky and Pre-commit will ensure that all your code is properly formatted before you commit your code. Please do not skip this check, it'll help us accept your PRs faster.

6. Testing And Overall Quality Practices

Testing Badge

Assign componentFolder to your preferred location for your tests. ⏳

{
    "experimentalComponentTesting": true,
    "componentFolder": "cypress/component",
    "specFiles": "*spec.*",
    "defaultCommandTimeout": 4000,
    "execTimeout": 200000,
    "taskTimeout": 200000
}
All the components which are having unit tests are present in cypress/components folder.


7. Project Structure Practices

🏗️ The project structure is planned so that it is easier to to find the components necessary while coding. The various folders are explained below:

pages 📁

All such components that has a route associated with it will be part of this folder. eg "/home"

components 📁

Any global or shared components like input fields or buttons will be part of this folder.

views 📁

This folder house the various page components separated in different folders by the name of the page. This helps help find and organize your components.

containers/layout 📁

Reusable layout components are written in this folder.

theme 📁

This contains all theme related properties like colors, spacing etc.

redux 📁

All global state management files are in this redux folder.

graphql 📁

The schema for the queries, mutations and subscriptions are put in this folder.

models 📁

Global typescript interfaces and types that are put in this file.
It is separated in two folders one for redux models and one for graphql. The rest of the models are put directly in the folder.
NOTE: interfaces for component props are kept inside the index file of that component itself and only globally used models are put in models folder

public/locales 📁

This contains a language file which has all string constants used throughout the application. (If you want to see litmus portal in your local language, we would love to have your contribution)

svg 📁

SVG images that we import as React Components goes here.


8. Coding Style Guide

Airbnb Badge

This style guide is mostly based on the standards that are currently prevalent in JavaScript, although some conventions (i.e async/await or static class fields) may still be included or prohibited on a case-by-case basis. Currently, anything prior to stage 3 is not included nor recommended in this guide. 📟 We extend ESLint config to include AirBnB style guide.



Rules we follow from AirBnB style guide:

Basic Rules
Functional Component
Naming
Declaration
Alignment
Quotes
Spacing
Props
Refs
Parentheses
Methods
Ordering Learn more about these rules here



9. User Guide for Litmus Portal

Litmus-Portal provides console or UI experience for managing, monitoring, and events round chaos workflows. Chaos workflows consist of a sequence of experiments run together to achieve the objective of introducing some kind of fault into an application or the Kubernetes platform.


View the entire User Guide here


