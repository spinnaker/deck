'use strict';

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var webpack = require('webpack');
var IgnorePlugin = require("webpack/lib/IgnorePlugin");
var path = require('path');

var nodeModulePath = path.join(__dirname, 'node_modules');
var bowerModulePath = path.join(__dirname, 'bower_components');

module.exports = {
  debug: true,
  entry: {
    settings: './settings.js',
    app: './app/scripts/app.js',
  },
  output: {
    path: path.join(__dirname, 'build', 'webpack', process.env.SPINNAKER_ENV || ''),
    filename: '[name].js',

  },
  module: {

    //noParse: [
    //  /\.spec\.js$/,
    //],
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
        loader: 'ng-annotate!babel!envify!eslint',
        exclude: /node_modules(?!\/utils)/,
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
    //root: [nodeModulePath, bowerModulePath],
    alias: {
      //uiselect: 'angular-ui-select/dist/select.js'
      'cloud:registry': path.join(__dirname, '/app/scripts/modules/core/cloudProvider/cloudProvider.registry.js'),
      'utils:jquery': path.join(__dirname, '/app/scripts/modules/utils/jQuery.js'),
      'utils:lodash': path.join(__dirname, '/app/scripts/modules/utils/lodash.js'),
      'utils:moment': path.join(__dirname, '/app/scripts/modules/utils/moment.js'),
      'cache:infrastructure': path.join(__dirname, 'app/scripts/modules/caches/infrastructureCaches.js'),
      'reader:loadBalancer': path.join(__dirname, '/app/scripts/modules/loadBalancer/loadBalancer.read.service.js'),
    }
  },
  resolveLoader: {
    root: nodeModulePath
  },
  plugins: [
    //new IgnorePlugin(
    //  /\.spec/
    //),
    new webpack.optimize.CommonsChunkPlugin(
      /* filename= */"init.js"
    ),
    new HtmlWebpackPlugin({
      title: 'Spinnaker',
      template: './app/index.html',
      favicon: 'app/favicon.ico',
      inject: true,
    }),
  ],
  devServer: {
    port: process.env.DECK_PORT || 9000,
    host: process.env.DECK_HOST || "localhost"
  }
};
