'use strict';

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
//var webpack = require('webpack');
//var IgnorePlugin = require("webpack/lib/IgnorePlugin");
var path = require('path');
var webpack = require('webpack');

var nodeModulePath = path.join(__dirname, 'node_modules');
//var bowerModulePath = path.join(__dirname, 'bower_components');

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
        loader: 'ng-annotate!babel!eslint',
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
    //root: [nodeModulePath, bowerModulePath],
    alias: {
      //lodash: 'utils/lodash.js'
      //angular: 'imports?window={}!exports?window.angular!angular/angular.js',
      //uiselect: 'angular-ui-select/dist/select.js'
    }
  },
  resolveLoader: {
    root: nodeModulePath
  },
  plugins: [
    new CommonsChunkPlugin(
      /* filename= */'init.js'
    ),
    new HtmlWebpackPlugin({
      title: 'Spinnaker',
      template: './app/index.html',
      favicon: 'app/favicon.ico',
      inject: true,
    }),
    new webpack.DefinePlugin({
      __GATE_HOST__: process.env.API_HOST || 'spinnaker-api-prestaging.prod.netflix.net',
      __AUTH__: null,
      __PROTOCOL__: null,
      __FEEDBACK_URL__: process.env.FEEDBACK_URL || 'http://hootch.test.netflix.net/submit',
      __BAKERY_DETAILS_URL__: process.env.BAKERY_DETAIL_URL || 'http://bakery.test.netflix.net/#/?region={{context.region}}&package={{context.package}}&detail=bake:{{context.status.resourceId}}',
      __AUTH_ENDPOINT__: process.env.AUTH_ENDPOINT || 'spinnaker-api-prestaging.prod.netflix.net/auth/info',
      __HTTPS_ENABLED__: process.env.HTTPS !== 'disabled',
      __DEFAULT_TIME_ZONE__: process.env.TIME_ZONE || 'America/Los_Angeles',
    }),
  ],
  devServer: {
    port: process.env.DECK_PORT || 9000,
    host: process.env.DECK_HOST || 'localhost'
  }
};
