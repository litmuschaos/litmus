const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const commonConfig = require('./webpack.common');

require('dotenv').config();

const prodConfig = {
  mode: 'production',
  devtool: 'hidden-source-map',
  output: {
    filename: '[name].[contenthash:6].js',
    chunkFilename: '[name].[id].[contenthash:6].js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:6].css',
      chunkFilename: '[name].[id].[contenthash:6].css',
      ignoreOrder: true
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true
    })
  ]
};

module.exports = merge(commonConfig, prodConfig);
