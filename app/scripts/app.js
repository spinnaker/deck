'use strict';
let angular = require('angular');

import {APPENGINE_MODULE} from './modules/appengine/appengine.module.js';

module.exports = angular.module('netflix.spinnaker', [
  require('./modules/netflix/netflix.module.js'),
  require('./modules/core/core.module.js'),
  require('./modules/amazon/aws.module.js'),
  require('./modules/google/gce.module.js'),
  require('./modules/cloudfoundry/cf.module.js'),
  require('./modules/titus/titus.module.js'),
  require('./modules/azure/azure.module.js'),
  require('./modules/kubernetes/kubernetes.module.js'),
  require('./modules/openstack/openstack.module.js'),
  require('./modules/docker/docker.module.js'),
  APPENGINE_MODULE,
]);
