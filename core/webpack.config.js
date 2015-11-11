'use strict';

var path = require('path');

var nodeModulePath = path.join(__dirname, 'node_modules');

module.exports = {
  debug: true,
  entry: './lib/index.js',
  output: {
    libraryTarget: "umd",
    library: "spinnaker.core",
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
  },
  externals: [{
    'angular': {
      root: 'angular',
      amd: 'angular',
      commonjs2: 'angular',
      commonjs: 'angular',
    }
  }],

  module: {
    loaders: [
      {
        test: /jquery\.js$/,
        loader: 'expose?jQuery',
      },
      {
        test: /\.css$/,
        loader: 'style!css',
      },
      {
        test: /\.js$/,
        loader: 'ng-annotate!deck!babel!envify!eslint',
        exclude: /node_modules(?!\/clipboard)/,
      },
      {
        test: /\.less$/,
        loader: 'style!css!less',
      },
      {
        test: /\.(woff|otf|ttf|eot|svg|png|gif|ico)(.*)?$/,
        loader: 'file',
      },
      {
        test: /\.html$/,
        loader: 'ngtemplate?relativeTo=' + (path.resolve(__dirname))  + '/!html'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ],
  },
  resolve: {
    alias: {
      "fonts": path.join(__dirname, "fonts"),
      "utils": path.join(__dirname, "lib", "utils"),
    },
  },
  resolveLoader: {
    root: nodeModulePath
  },
};
