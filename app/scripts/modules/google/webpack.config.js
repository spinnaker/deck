'use strict';

const path = require('path');
const basePath = path.join(__dirname, '..', '..', '..', '..');
const NODE_MODULE_PATH = path.join(basePath, 'node_modules');
const HappyPack = require('happypack');
const HAPPY_PACK_POOL_SIZE = process.env.HAPPY_PACK_POOL_SIZE || 3;
const happyThreadPool = HappyPack.ThreadPool({size: HAPPY_PACK_POOL_SIZE});
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const exclusionPattern = /(node_modules|\.\.\/deck)/;

module.exports = {
  context: basePath,
  entry: {
    lib: path.join(__dirname, 'src', 'index.ts'),
  },
  output: {
    path: path.join(__dirname, 'lib'),
    filename: '[name].js',
    library: '@spinnaker/google',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  externals: {
    '@spinnaker/core': '@spinnaker/core',
    'angular': 'angular',
    'lodash': 'lodash',
    'rxjs': 'rxjs',
    '@uirouter/core': '@uirouter/core',
    '@uirouter/angularjs': '@uirouter/angularjs',
    'angular-ui-bootstrap': 'angular-ui-bootstrap',
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.ts', '.tsx', '.css', '.less', '.html'],
    modules: [
      NODE_MODULE_PATH,
      path.resolve('.'),
    ],
    alias: {
      '@spinnaker/google': path.join(__dirname, 'src'),
      'coreImports': path.resolve(basePath, 'app', 'scripts', 'modules', 'core', 'src', 'presentation', 'less', 'imports', 'commonImports.less'),
      'coreColors': path.resolve(basePath, 'app', 'scripts', 'modules', 'core', 'src', 'presentation', 'less', 'imports', 'colors.less'),
      'google': path.join(__dirname, 'src')
    }
  },
  devtool: "source-map",
  watch:  process.env.WATCH === 'true',
  module: {
    rules: [
      {test: /\.json$/, loader: 'json-loader'},
      {test: /\.tsx?$/, use: ['happypack/loader?id=ts'], exclude: exclusionPattern},
      {test: /\.(woff|otf|ttf|eot|svg|png|gif|ico)(.*)?$/, use: 'file-loader'},
      {test: /\.js$/, use: ['happypack/loader?id=js'], exclude: exclusionPattern},
      {
        test: require.resolve('jquery'),
        use: [
          'expose-loader?$',
          'expose-loader?jQuery'
        ]
      },
      {
        test: /\.less$/,
        use: ['happypack/loader?id=less']
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.html$/,
        use: ['happypack/loader?id=lib-html'],
        exclude: exclusionPattern,
      }
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      beautify: true,
      comments: false,
      sourceMap: true,
    }),
    new HappyPack({
      id: 'lib-html',
      loaders: [
        'ngtemplate-loader?relativeTo=' + (path.resolve(__dirname)) + '&prefix=google',
        'html-loader'
      ],
      threadPool: happyThreadPool
    }),
    new HappyPack({
      id: 'js',
      loaders: [
        'babel-loader',
        'envify-loader',
        'eslint-loader'
      ],
      threadPool: happyThreadPool,
    }),
    new HappyPack({
      id: 'ts',
      loaders: [
        'babel-loader',
        { path: 'ts-loader', query: { happyPackMode: true } },
        'tslint-loader',
      ],
      threadPool: happyThreadPool,
    }),
    new HappyPack({
      id: 'less',
      loaders: [
        'style-loader',
        'css-loader',
        'less-loader'
      ],
      threadPool: happyThreadPool
    }),
  ],
};
