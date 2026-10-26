const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const _ = require('lodash');
const chalk = require('chalk');

const stringsFile = 'src/strings/strings.en.yaml';

const content = fs.readFileSync(path.resolve(process.cwd(), stringsFile), 'utf-8');
const stringsData = yaml.parse(content);

let errors = 0;

// check for duplicate values
const valuesMap = new Map();
function checkForDuplicateValues(data, parentPath = []) {
  Object.keys(data).forEach(key => {
    const value = data[key];
    const path = [...parentPath, key].join('.');

    if (typeof value === 'string') {
      if (valuesMap.has(value)) {
        errors++;
        console.log(
          `${chalk.red('error:')} '${path}' has duplicate value of '${value}'. Please use "${valuesMap.get(
            value
          )}" instead or extract the value to a common place`
        );
      } else {
        valuesMap.set(value, `${path}`);
      }
    } else {
      checkForDuplicateValues(value, [...parentPath, key]);
    }
  });
}

// perform actual checks
console.log(chalk.blueBright(`\nChecking for duplicate values in strings`));
checkForDuplicateValues(stringsData);

if (errors > 0) {
  console.log(chalk.red(`\n❌ ${errors} error(s) found`));
  process.exit(1);
} else {
  console.log(chalk.green(`\n✅  0 errors found <3`));
}
