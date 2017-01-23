const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
// const HappyPack = require('happypack');
const path = require('path');
const NODE_MODULE_PATH = path.join(__dirname, 'node_modules');
const fs = require('fs');

function configure(IS_TEST) {

  // const POOL_SIZE = IS_TEST ? 3 : 6;
  // const happyThreadPool = HappyPack.ThreadPool({size: POOL_SIZE});
  function getTypescriptLinterLoader() {
    return {
      enforce: 'pre',
      test: IS_TEST ? /\.spec.ts$/ : /\.ts$/,
      use: 'tslint-loader'
    };
  }

  function getJavascriptLoader() {
    return {
      test: /\.js$/,
      exclude: /node_modules(?!\/clipboard)/,
      use: [
        'ng-annotate-loader',
        'angular-loader',
        'babel-loader',
        'envify-loader',
        'eslint-loader'
      ]
    };
  }

  function getLessLoader() {
    return {
      test: /\.less$/,
      use: [
        'style-loader',
        'css-loader',
        'less-loader'
      ]
    };
  }

  function getHtmlLoader() {
    return {
      test: /\.html$/,
      use: [
        'ngtemplate-loader?relativeTo=' + (path.resolve(__dirname)) + '/',
        'html-loader'
      ]
    };
  }

  const config = {
    output: IS_TEST ? {} : {
        path: path.join(__dirname, 'build', 'webpack', process.env.SPINNAKER_ENV || ''),
        filename: '[name].js',
      },
    resolveLoader: IS_TEST ? {} : {
        modules: [
          NODE_MODULE_PATH
        ],
        moduleExtensions: ['-loader']
      },
    resolve: {
      extensions: ['.json', '.js', '.ts', '.css', '.less', '.html'],
      modules: [
        NODE_MODULE_PATH,
        path.join(__dirname, 'app', 'scripts', 'modules'),
      ]
    },
    module: {
      rules: [
        {
          test: require.resolve('jquery'),
          use: [
            'expose-loader?$',
            'expose-loader?jQuery'
          ]
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(woff|otf|ttf|eot|svg|png|gif|ico)(.*)?$/,
          use: 'file-loader'
        }
      ],
    },
    devServer: IS_TEST ? {} : {
        port: process.env.DECK_PORT || 9000,
        host: process.env.DECK_HOST || 'localhost',
        https: process.env.DECK_HTTPS === 'true'
      },
    watch: IS_TEST
  };

  if (process.env.DECK_CERT) {
    config.devServer.cert = fs.readFileSync(process.env.DECK_CERT);
    config.devServer.key = fs.readFileSync(process.env.DECK_KEY);
    if (process.env.DECK_CA_CERT) {
      config.devServer.cacert = fs.readFileSync(process.env.DECK_CA_CERT);
    }
  }

  config.module.rules.push(
    getTypescriptLinterLoader(),
    getJavascriptLoader(),
    getLessLoader(),
    getHtmlLoader());

  if (IS_TEST) {

    // this is broken.  commenting out for now due to
    // https://github.com/deepsweet/istanbul-instrumenter-loader/issues/32
    // which, in turn, is waiting on https://github.com/karma-runner/karma-coverage/pull/251
    // i'd like to switch to a different reporter tool, e.g., karma-remap-istanbul has good output.
    // config.module.rules.push({
    //   test: /\.js$/,
    //   enforce: 'post',
    //   exclude: /(test|node_modules|bower_components)\//,
    //   use: 'istanbul-instrumenter-loader'
    // });

    config.plugins = [];
    //config.plugins = [
    //  new HappyPack({
    //    id: 'jstest',
    //    loaders: ['ng-annotate!angular!babel!envify!eslint'],
    //    threadPool: happyThreadPool,
    //    cacheContext: {
    //      env: process.env,
    //    },
    //  })
    //];
  } else {

    config.entry = {
      settings: './settings.js',
      app: './app/scripts/app.js',
      vendor: [
        'jquery', 'angular', 'angular-ui-bootstrap', 'angular-ui-router',
        'source-sans-pro', 'angular-cache', 'angular-marked', 'angular-messages', 'angular-sanitize',
        'bootstrap', 'clipboard', 'd3', 'jquery-ui', 'moment-timezone', 'rxjs'
      ]
    };

    config.plugins = [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: 'vendor.bundle.js'
      }),
      new webpack.optimize.CommonsChunkPlugin('init'),
      new HtmlWebpackPlugin({
        title: 'Spinnaker',
        template: './app/index.deck',
        favicon: 'app/favicon.ico',
        inject: true,

        // default order is based on webpack's compile process
        // with the migration to webpack two, we need this or
        // settings.js is put at the end of the <script> blocks
        // which breaks the booting of the app.
        chunksSortMode: (a, b) => {
          const chunks = ['init', 'vendor', 'settings', 'app'];
          return chunks.indexOf(a.names[0]) - chunks.indexOf(b.names[0]);
        }
      }),
      //new HappyPack({
      //  id: 'js',
      //  loaders: ['ng-annotate!angular!babel!envify!eslint'],
      //  threadPool: happyThreadPool,
      //  cacheContext: {
      //    env: process.env,
      //  },
      //}),
      //new HappyPack({
      //  id: 'html',
      //  loaders: ['ngtemplate?relativeTo=' + (path.resolve(__dirname)) + '/!html'],
      //  threadPool: happyThreadPool,
      //}),
      //new HappyPack({
      //  id: 'less',
      //  loaders: ['style!css!less'],
      //  threadPool: happyThreadPool,
      //}),
    ];
  }

  // this is temporary and will be deprecated in WP3.  moving forward,
  // loaders will individually need to accept this as an option.
  config.plugins.push(new webpack.LoaderOptionsPlugin({debug: !IS_TEST}));

  return config;
}

module.exports = configure;
