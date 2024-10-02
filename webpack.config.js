//@ts-check

'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');


/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node', // vscode extensions run in webworker context for VS Code web 📖 -> https://webpack.js.org/configuration/target/#target

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/scripts', to: 'scripts' }, // Copy all Python files from src/scripts to dist/scripts
        { from: 'src/media', to: 'media' },     // Copy all media files from src/media to dist/media
      ],
    }),
  ],
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    mainFields: ['main'], // look for `browser` entry point in imported node modules
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.py$/, // Python file handling
        type: 'asset/resource',
        generator: {
          filename: 'scripts/[name][ext]', // Copies Python files to `dist/scripts/`
        },
      },
    ]
  }
};
module.exports = config;
