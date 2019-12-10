/// <reference path="wait-on.d.ts" />

import * as waitOn from 'wait-on';
const configure = require('../../../webpack.config.js');

const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const express = require('express');
const app = express();

const WAIT_INTERVAL_MS = 500;
const WAIT_TIMEOUT_MS = 300000;

export class StaticServer {
  private server: any;

  constructor() {}

  public launch(): Promise<void | Error> {
    return new Promise((resolve, reject) => {
      console.log('Creating a promise');

      const webpackConfig = configure({}, {});
      const compiler = webpack(webpackConfig);
      app.use(
        middleware(compiler, {
          publicPath: '/',
        }),
      );

      this.server = app.listen(9000, () => console.log('webpack-dev-middleware listening on port 9000'));
      waitOn(
        {
          interval: WAIT_INTERVAL_MS,
          timeout: WAIT_TIMEOUT_MS,
          resources: ['http-get://localhost:9000'],
        },
        (err: Error) => {
          if (err) {
            reject(new Error(`failed to launch webpack-dev-server: ${err}`));
            this.kill();
          } else {
            resolve();
          }
        },
      );
    });
  }

  public kill(): void {
    this.server && this.server.close();
    this.server = null;
  }
}
