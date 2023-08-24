import { defineConfig } from '@harnessio/oats-cli';
import reactQueryPlugin from '@harnessio/oats-plugin-react-query';
import { mapKeys, omit } from 'lodash-es';

function normalizePath(url: string): string {
  return url.replace(/\/{2,}/g, '/');
}

export default defineConfig({
  services: {
    auth: {
      url: 'https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/auth/v3.0.0/auth-api.json',
      output: 'src/api/auth',
      transformer(spec) {
        return {
          ...spec,
          components: {
            ...spec.components,
            schemas: omit(spec.components?.schemas, ['OauthSettings'])
          },
          paths: mapKeys(spec.paths, (_val, key) => normalizePath(`/auth/${key}`))
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
