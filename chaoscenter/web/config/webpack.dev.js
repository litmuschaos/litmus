const path = require('path');
const fs = require('fs');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const commonConfig = require('./webpack.common');

require('dotenv').config();

const CONTEXT = process.cwd();
const isCI = process.env.CI === 'true';
const baseUrl = process.env.BASE_URL;
const targetLocalHost = (process.env.TARGET_LOCALHOST && JSON.parse(process.env.TARGET_LOCALHOST)) ?? true; // set to false to target baseUrl environment instead of localhost

const certificateExists = fs.existsSync(path.join(CONTEXT, 'certificates/localhost.pem'));

// certificates are required in non CI environments only
if (!isCI && !certificateExists) {
  throw new Error('The certificate is missing, please run `yarn generate-certificate`');
}

const devConfig = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'cheap-module-source-map',
  cache: { type: 'filesystem' },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].[id].js'
  },
  devServer: isCI
    ? undefined
    : {
        static: [path.join(process.cwd(), 'src/static')],
        historyApiFallback: true,
        port: 8184,
        server: {
          type: 'https',
          options: {
            key: fs.readFileSync(path.resolve(CONTEXT, 'certificates/localhost-key.pem')),
            cert: fs.readFileSync(path.resolve(CONTEXT, 'certificates/localhost.pem'))
          }
        },
        proxy: {
          '/chaos/manager/api': {
            pathRewrite: { '^/chaos/manager/api': '' },
            target: process.env.CHAOS_MANAGER
              ? process.env.CHAOS_MANAGER
              : targetLocalHost
              ? 'http://localhost:8080'
              : `${baseUrl}/chaos/manager/api`,
            secure: false,
            changeOrigin: true,
            logLevel: 'info'
          },
          '/auth': {
            pathRewrite: { '^/auth': '' },
            target: process.env.CHAOS_MANAGER
              ? process.env.CHAOS_MANAGER
              : targetLocalHost
              ? 'http://localhost:3000'
              : `${baseUrl}/auth`,
            secure: false,
            changeOrigin: true,
            logLevel: 'info'
          }
        }
      },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].[id].css',
      ignoreOrder: true
    }),
    new HTMLWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      minify: false
    }),
    new DefinePlugin({
      'process.env': '{}', // required for @blueprintjs/core
      __DEV__: true,
      __ENABLE_CDN__: false
    })
  ]
};

module.exports = merge(commonConfig, devConfig);
