const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const config = yaml.load(fs.readFileSync(path.join(__dirname, '.eslintrc.yml'), 'utf8'));

module.exports = {
  ...config,
  parserOptions: {
    ...config.parserOptions,
    tsconfigRootDir: __dirname,
  },
  settings: {
    ...config.settings,
    'import/resolver': {
      ...config.settings['import/resolver'],
      typescript: {
        ...config.settings['import/resolver'].typescript,
        project: path.join(__dirname, 'tsconfig.json'),
      },
    },
  },
};