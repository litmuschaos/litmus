/**
 * @type {Cypress.PluginConfig}
 */

module.exports = (on, config) => {
  require('cypress-react-unit-test/plugins/react-scripts')(on, config);
  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config;
};
