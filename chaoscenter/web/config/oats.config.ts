import { defineConfig } from '@harnessio/oats-cli';
import reactQueryPlugin from '@harnessio/oats-plugin-react-query';
import { mapKeys, omit } from 'lodash-es';

export default defineConfig({
  services: {
    auth: {
      url: 'https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/auth/v3.0.0/auth-api.json',
      output: 'src/api/auth/index.ts',
      transformer(spec) {
        return {
          ...spec,
          components: {
            ...spec.components,
            schemas: omit(spec.components?.schemas, ['OauthSettings'])
          },
          paths: mapKeys(spec.paths, (_val, key) => `/auth${key}`)
        };
      },
      genOnlyUsed: true,
      plugins: [
        reactQueryPlugin({
          customFetcher: 'services/fetcher',
          overrides: {}
        })
      ]
    }
  }
});
