'use strict';

var testsContext = require.context("./lib/", true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);
