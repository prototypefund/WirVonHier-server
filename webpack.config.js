require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const VERSION = require('./package.json').version;

module.exports = async function (env, argv) {
  return {
	  mode: 'production',
	  // Turn off various NodeJS environment polyfills Webpack adds to bundles.
    node: {
      console: false,
      // Keep global, it's just an alias of window and used by many third party modules:
      global: true,
      // Turn off process to avoid bundling a nextTick implementation:
      process: false,
      // Inline __filename and __dirname values:
      __filename: 'mock',
      __dirname: 'mock',
      // Never embed a portable implementation of Node's Buffer module:
      Buffer: false,
      // Never embed a setImmediate implementation:
      setImmediate: false
	  },
    performance: {
      hints: false,
    },
    entry: {
      server: './src/index.ts'
    },
    devtool: 'source-map',
    stats: 'minimal',
    output: {
      filename: '[name].js',
      chunkFilename: 'js/[name].js',
      libraryTarget: 'commonjs2',
      path: path.resolve(__dirname, './dist'),
      publicPath: '/',
      globalObject: 'self',
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
      devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
    },
    target: 'node',
    externals: [nodeExternals()],
    resolve: {
      extensions: ['.ts', '.js'],
      plugins: [
        new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })
      ].filter(Boolean)
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'cache-loader',
            },
            {
              loader: 'thread-loader'
            },
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                happyPackMode: true
              }
            },
            {
              loader: 'eslint-loader'
            }
          ].filter(Boolean)
        },
        {
          test: /\.js$/,
          use: [
            {
              loader: 'eslint-loader'
            }
          ].filter(Boolean)
        },     
      ]
    },
    plugins: [
      new FriendlyErrorsWebpackPlugin(),
      new ForkTsCheckerWebpackPlugin(
        {
          vue: true,
          tslint: false,
          formatter: 'codeframe',
          checkSyntacticErrors: false
        }
      ),
      // Remove old files before outputting a production build:
      new CleanWebpackPlugin({
        verbose: false,
      }),

      new webpack.DefinePlugin({
        VERSION: JSON.stringify(VERSION),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        APP_BASE_URL: JSON.stringify(process.env.APP_BASE_URL),
      }),
    ].filter(Boolean),
    optimization: {
      minimize: false,
      minimizer: [],
    }
  };
};
