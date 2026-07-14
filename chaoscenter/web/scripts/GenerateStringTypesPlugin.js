const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const _ = require('lodash');
const mustache = require('mustache');

function flattenKeys(data, parentPath = []) {
  const keys = [];

  _.keys(data).forEach(key => {
    const value = data[key];
    const newPath = [...parentPath, key];

    if (Array.isArray(value)) {
      throw new TypeError(`Array is not supported in strings.yaml\nPath: "${newPath.join('.')}"`);
    }

    if (_.isPlainObject(data[key])) {
      keys.push(...flattenKeys(data[key], [...parentPath, key]));
    } else {
      keys.push([...parentPath, key].join('.'));
    }
  });

  keys.sort();

  return keys;
}

function template(content, partialType) {
  let typeStr = 'Record<T, string | number | boolean>';

  if (partialType) {
    typeStr = `Partial<${typeStr}>`;
  }

  return `/**
* This file is auto-generated. Please do not modify this file manually.
* Use the command \`yarn strings\` to regenerate this file.
*/
export type PrimitiveObject<T extends string> = ${typeStr}

export interface StringsMap {
    ${content}
}`;
}

async function generateStringTypes({ input, output, context, preProcess, partialType }) {
  const content = await fs.promises.readFile(path.resolve(context, input), 'utf8');
  const parsedData = yaml.parse(content);

  const keys = flattenKeys(parsedData)
    .map(key => {
      const template = _.get(parsedData, key);
      const variables = mustache
        .parse(template)
        .filter(v => v[0] === 'name' || v[0] === '#' || v[0] === '&')
        .map(v => v[1])
        .filter(v => !v.startsWith('$'))
        .map(v => `'${v}'`);
      const uniqVariables = _.uniq(variables);
      const valueType = uniqVariables.length > 0 ? `PrimitiveObject<${variables.join(' | ')}>` : 'unknown';

      return `'${key}': ${valueType}`;
    })
    .join('\n  ');

  let typesContent = template(keys, partialType);

  if (typeof preProcess === 'function') {
    typesContent = await preProcess(typesContent);
  }

  return fs.promises.writeFile(path.resolve(context, output), typesContent, 'utf8');
}

class GenerateStringTypesPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { input, output, preProcess, partialType } = this.options;

    compiler.hooks.emit.tapAsync('GenerateStringTypesPlugin', (compilation, callback) => {
      try {
        generateStringTypes({ input, output, context: compiler.context, preProcess, partialType }).then(
          () => callback(),
          e => callback(e)
        );
      } catch (e) {
        callback(e);
      }
    });
  }
}

module.exports.GenerateStringTypesPlugin = GenerateStringTypesPlugin;
