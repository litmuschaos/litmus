const { defaults: tsjPreset } = require('ts-jest/presets');
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    ...tsjPreset.transform,
    '^.+\\.svg$': '<rootDir>/scripts/jest/svgTransform.js'
  },
  setupFiles: ['fake-indexeddb/auto'],
  testEnvironmentOptions: {
    beforeParse(window) {
      console.log('------------------------------------------  log ');
      window.document.childNodes.length === 0;
      window.alert = msg => {
        console.log(msg);
      };
      window.matchMedia = () => ({});
      window.scrollTo = () => {};
    }
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(date-fns|lodash-es|p-debounce)/)'],
  testPathIgnorePatterns: ['<rootDir>/dist'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/test/jest/__mocks__/fileMock.js',
    '\\.yaml$': 'yaml-jest',
    '\\.s?css$': 'identity-obj-proxy',
    ...pathsToModuleNameMapper(compilerOptions.paths)
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/?(*.)(spec|test).{ts,tsx}',
    '!<rootDir>/src/**/index.ts'
  ],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules', 'src'],
  coveragePathIgnorePatterns: ['/node_modules/', 'dist/', '/config/', 'nginx/'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{tsx,jsx}',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/api/**',
    '!<rootDir>/src/controllers/**',
    '!<rootDir>/src/models/**',
    '!<rootDir>/src/images/**'
  ],
  coverageThreshold: {
    // global: {
    //   branches: 90,
    //   functions: 90,
    //   lines: 90,
    //   statements: 90
    // }
  },
  testResultsProcessor: 'jest-sonar-reporter'
};
