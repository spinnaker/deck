const webpack = require('webpack');
const HappyPack = require('happypack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');
const NODE_MODULE_PATH = path.join(__dirname, 'node_modules');
const fs = require('fs');
function configure(IS_TEST) {

  const POOL_SIZE = IS_TEST ? 3 : 6;
  const happyThreadPool = HappyPack.ThreadPool({size: POOL_SIZE});

  const config = {
    plugins: [],
    output: IS_TEST ? undefined : {
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
      extensions: ['.json', '.js', '.jsx', '.ts', '.tsx', '.css', '.less', '.html'],
      modules: [
        NODE_MODULE_PATH,
        path.join(__dirname, 'app', 'scripts', 'modules'),
      ],
      alias: {
        'root': __dirname,
        'core': path.join(__dirname, 'app', 'scripts', 'modules', 'core', 'src'),
        '@spinnaker/core': path.join(__dirname, 'app', 'scripts', 'modules', 'core', 'src'),
        'docker': path.join(__dirname, 'app', 'scripts', 'modules', 'docker', 'src'),
        '@spinnaker/docker': path.join(__dirname, 'app', 'scripts', 'modules', 'docker', 'src'),
        'amazon': path.join(__dirname, 'app', 'scripts', 'modules', 'amazon', 'src'),
        '@spinnaker/amazon': path.join(__dirname, 'app', 'scripts', 'modules', 'amazon', 'src'),
        'google': path.join(__dirname, 'app', 'scripts', 'modules', 'google', 'src'),
        '@spinnaker/google': path.join(__dirname, 'app', 'scripts', 'modules', 'google', 'src'),
        'coreImports': path.resolve(__dirname, 'app', 'scripts', 'modules', 'core', 'src', 'presentation', 'less', 'imports', 'commonImports.less'),
        'coreColors': path.resolve(__dirname, 'app', 'scripts', 'modules', 'core', 'src', 'presentation', 'less', 'imports', 'colors.less'),
      }
    },
    module: {
      rules: [
        {test: /\.json$/, loader: 'json-loader'},
        {test: /\.tsx?$/, use: ['ng-annotate-loader', 'awesome-typescript-loader', 'tslint-loader'], exclude: /node_modules/},
        {test: /\.(woff|otf|ttf|eot|png|gif|ico)(.*)?$/, use: 'file-loader'},
        {test: /\.js$/, use: ['happypack/loader?id=js'], exclude: /node_modules(?!\/clipboard)/},
        {
          test: require.resolve('jquery'),
          use: [
            'expose-loader?$',
            'expose-loader?jQuery'
          ]
        },
        {
          test: /\.svg(.*)?$/,
          exclude: /\/app\/scripts\/modules\/core\/src\/widgets\/spinners/,
          use: 'file-loader'
        },
        {
          test: /\.svg(.*)?$/,
          include: /\/app\/scripts\/modules\/core\/src\/widgets\/spinners/,
          use: ['svg-react-loader']
        },
        {
          test: /\.less$/,
          use: IS_TEST ? ['style-loader', 'css-loader', 'less-loader'] : ['happypack/loader?id=less']
        },
        {
          test: /\.css$/,
          use: IS_TEST ? ['style-loader', 'css-loader'] : [
            'style-loader',
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.html$/,
          use: ['happypack/loader?id=html']
        }
      ],
    },
    devServer: IS_TEST ? {} : {
        port: process.env.DECK_PORT || 9000,
        host: process.env.DECK_HOST || 'localhost',
        https: process.env.DECK_HTTPS === 'true'
      },
    watch: IS_TEST,
    externals: {
      'cheerio': 'window',
      'react/addons': 'react',
      'react/lib/ExecutionEnvironment': 'react',
      'react/lib/ReactContext': 'react',
    },
  };

  if (process.env.DECK_CERT) {
    config.devServer.cert = fs.readFileSync(process.env.DECK_CERT);
    config.devServer.key = fs.readFileSync(process.env.DECK_KEY);
    if (process.env.DECK_CA_CERT) {
      config.devServer.cacert = fs.readFileSync(process.env.DECK_CA_CERT);
    }
  }

  config.plugins = [
    new HappyPack({
      id: 'html',
      loaders: [
        'ngtemplate-loader?relativeTo=' + (path.resolve(__dirname)) + '/',
        'html-loader'
      ],
      threadPool: happyThreadPool
    }),
    new HappyPack({
      id: 'js',
      loaders: [
        'ng-annotate-loader',
        'angular-loader',
        'babel-loader',
        'envify-loader',
        'eslint-loader'
      ],
      threadPool: happyThreadPool,
      cacheContext: {
        env: process.env
      }
    })
  ];

  if (!IS_TEST) {
    config.entry = {
      settings: './settings.js',
      app: './app/scripts/app.ts',
      vendor: [
        'jquery', 'angular', 'angular-ui-bootstrap', 'source-sans-pro',
        'angular-cache', 'angular-messages', 'angular-sanitize', 'bootstrap',
        'clipboard', 'd3', 'jquery-ui', 'moment-timezone', 'rxjs', 'react', 'angular2react',
        'react2angular', 'react-bootstrap', 'react-dom', 'react-ga', 'ui-select',
        '@uirouter/angularjs', '@uirouter/visualizer',
      ]
    };

    config.plugins.push(...[
      new HappyPack({
        id: 'less',
        loaders: [
          'style-loader',
          'css-loader',
          'less-loader'
        ],
        threadPool: happyThreadPool
      }),
      new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor.bundle.js'}),
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
      })
    ]);
  }

  // this is temporary and will be deprecated in WP3.  moving forward,
  // loaders will individually need to accept this as an option.
  config.plugins.push(new webpack.LoaderOptionsPlugin({debug: !IS_TEST}));

  return config;
}

module.exports = configure;
