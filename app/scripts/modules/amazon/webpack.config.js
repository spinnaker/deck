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
    library: '@spinnaker/amazon',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  externals: {
    '@spinnaker/core': '@spinnaker/core',
    '@uirouter/angularjs': '@uirouter/angularjs',
    '@uirouter/core': '@uirouter/core',
    '@uirouter/react': '@uirouter/react',
    'angular': 'angular',
    'angular-ui-bootstrap': 'angular-ui-bootstrap',
    'exports-loader?"n3-line-chart"!n3-charts/build/LineChart.js': 'exports-loader?"n3-line-chart"!n3-charts/build/LineChart.js',
    'lodash': 'lodash',
    'prop-types': 'prop-types',
    'rxjs': 'rxjs',
    'react': 'react',
    'react-bootstrap': 'react-bootstrap',
    'react-dom': 'react-dom',
    'react-ga': 'react-ga',
    'react2angular': 'react2angular',
    'react-select': 'react-select',
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx', '.ts', '.tsx', '.css', '.less', '.html'],
    modules: [
      NODE_MODULE_PATH,
      path.resolve('.'),
    ],
    alias: {
      '@spinnaker/amazon': path.join(__dirname, 'src'),
      'coreImports': path.resolve(basePath, 'app', 'scripts', 'modules', 'core', 'src', 'presentation', 'less', 'imports', 'commonImports.less'),
      'coreColors': path.resolve(basePath, 'app', 'scripts', 'modules', 'core', 'src', 'presentation', 'less', 'imports', 'colors.less'),
      'amazon': path.join(__dirname, 'src')
    }
  },
  watch:  process.env.WATCH === 'true',
  devtool: 'source-map',
  module: {
    rules: [
      {test: /\.js$/, use: ['happypack/loader?id=js'], exclude: exclusionPattern},
      {test: /\.tsx?$/, use: ['happypack/loader?id=ts'], exclude: exclusionPattern},
      {test: /\.(woff|otf|ttf|eot|svg|png|gif|ico)(.*)?$/, use: 'file-loader'},
      {test: /\.json$/, loader: 'json-loader'},
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
        'ngtemplate-loader?relativeTo=' + (path.resolve(__dirname)) + '&prefix=amazon',
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
