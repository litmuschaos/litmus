const packageJSON = require('../package.json');
const { pick, mapValues } = require('lodash');

/**
 * These packages must be stricly shared with exact versions
 */
const ExactSharedPackages = [
  'react-dom',
  'react',
  '@blueprintjs/core',
  '@blueprintjs/select',
  '@blueprintjs/datetime',
  'react-router-dom',
  'restful-react',
  'lodash-es'
];

/**
 * @type {import('webpack').ModuleFederationPluginOptions}
 */
module.exports = {
  name: 'chaos',
  filename: 'remoteEntry.js',
  exposes: {
    './MicroFrontendApp': './src/app/App'
  },
  shared: {
    formik: packageJSON.dependencies['formik'],
    ...mapValues(pick(packageJSON.dependencies, ExactSharedPackages), version => ({
      singleton: true,
      requiredVersion: version
    }))
  }
};
