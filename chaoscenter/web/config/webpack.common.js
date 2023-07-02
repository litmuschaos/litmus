const path = require('path');

const {
  container: { ModuleFederationPlugin },
  DefinePlugin
} = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { GenerateStringTypesPlugin } = require('../scripts/GenerateStringTypesPlugin');
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin');

const moduleFederationConfig = require('./moduleFederation.config');
const CONTEXT = process.cwd();

module.exports = {
  target: 'web',
  context: CONTEXT,
  stats: {
    modules: false,
    children: false
  },
  output: {
    publicPath: '/',
    path: path.resolve(CONTEXT, 'dist/'),
    pathinfo: false
  },
  entry: {
    [moduleFederationConfig.name]: './src/public-path'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.module\.scss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: '@teamsupercell/typings-for-css-modules-loader',
            options: {
              prettierConfigFile: path.resolve(__dirname, '../.prettierrc.yml'),
              disableLocalsExport: true
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                mode: 'local',
                localIdentName: 'chaos_[name]_[local]_[hash:base64:6]',
                exportLocalsConvention: 'camelCaseOnly'
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.join(CONTEXT, 'src')]
              },
              sourceMap: false,
              implementation: require('sass')
            }
          }
        ]
      },
      {
        test: /(?<!\.module)\.scss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: false
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.join(CONTEXT, 'src')]
              },
              implementation: require('sass')
            }
          }
        ]
      },
      {
        test: /\.ya?ml$/,
        type: 'json',
        use: [
          {
            loader: 'yaml-loader'
          }
        ]
      },
      {
        test: /\.(jpg|jpeg|png|svg|gif)$/,
        type: 'asset'
      }
    ]
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.tsx', '.json'],
    plugins: [new TsconfigPathsPlugin()]
  },
  plugins: [
    new ModuleFederationPlugin(moduleFederationConfig),
    new DefinePlugin({
      'process.env': '{}' // required for @blueprintjs/core
    }),
    new GenerateStringTypesPlugin({
      input: 'src/strings/strings.en.yaml',
      output: 'src/strings/types.ts'
    }),
    new RetryChunkLoadPlugin({
      retryDelay: 1000,
      maxRetries: 5
    })
  ]
};
