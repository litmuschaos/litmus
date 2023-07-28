import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { pick, forIn, has, set } from 'lodash';
import { load } from 'js-yaml';
import stringify from 'fast-json-stable-stringify';

export default inputSchema => {
  const argv = process.argv.slice(2);
  const config = argv[0];

  if (config) {
    const overridesFile = join('src/services', config, 'overrides.yaml');
    const transformFile = join('src/services', config, 'transform.js');

    let paths = inputSchema.paths;

    if (existsSync(overridesFile)) {
      const data = readFileSync(overridesFile, 'utf8');
      const { allowpaths, operationIdOverrides } = load(data);

      if (!allowpaths.includes('*')) {
        paths = pick(paths, ...allowpaths);
      }

      forIn(operationIdOverrides, (value, key) => {
        const [path, method] = key.split('.');

        if (path && method && has(paths, path) && has(paths[path], method)) {
          set(paths, [path, method, 'operationId'], value);
        }
      });
    }

    inputSchema.paths = paths;

    if (existsSync(transformFile)) {
      const transform = require(resolve(process.cwd(), transformFile));

      inputSchema = transform(inputSchema);
    }
  }

  // stringify and parse json to get a stable object
  return JSON.parse(stringify(inputSchema));
};
