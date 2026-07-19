const path = require('path');

const { DefinePlugin } = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { GenerateStringTypesPlugin } = require('../scripts/GenerateStringTypesPlugin');
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const CONTEXT = process.cwd();

// Configure PUBLIC_URL with proper normalization
const rawPublicUrl = process.env.PUBLIC_URL || '/';
// Ensure it starts with '/' if not already
const withLeadingSlash = rawPublicUrl.startsWith('/') ? rawPublicUrl : `/${rawPublicUrl}`;
// Remove all trailing slashes except for root '/'
const publicUrl = withLeadingSlash.replace(/\/+$/, '') || '/';
// publicPath should have trailing slash for webpack asset resolution
const publicPath = publicUrl === '/' ? '/' : `${publicUrl}/`;

module.exports = {
  target: 'web',
  context: CONTEXT,
  stats: {
    modules: false,
    children: false
  },
  output: {
    publicPath: publicPath,
    path: path.resolve(CONTEXT, 'dist/'),
    pathinfo: false
  },
  entry: './src/index.ts',
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
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.tsx', '.json'],
    plugins: [new TsconfigPathsPlugin()]
  },
  plugins: [
    new DefinePlugin({
      'process.env': '{}', // required for @blueprintjs/core
      'process.env.PUBLIC_URL': JSON.stringify(publicUrl)
    }),
    new GenerateStringTypesPlugin({
      input: 'src/strings/strings.en.yaml',
      output: 'src/strings/types.ts'
    }),
    new HTMLWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      minify: true
    }),
    new RetryChunkLoadPlugin({
      retryDelay: 1000,
      maxRetries: 5
    }),
    new MonacoWebpackPlugin({
      // Available options: https://github.com/microsoft/monaco-editor/tree/main/webpack-plugin#options
      languages: ['json', 'yaml', 'shell', 'powershell', 'python'],
      // This will define a global monaco object that is used in editor components.
      globalAPI: true,
      filename: '[name].worker.[contenthash:6].js',
      customLanguages: [
        {
          label: 'yaml',
          entry: 'monaco-yaml',
          worker: {
            id: 'monaco-yaml/yamlWorker',
            entry: 'monaco-yaml/yaml.worker'
          }
        }
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/static'
        }
      ]
    })
  ]
};
