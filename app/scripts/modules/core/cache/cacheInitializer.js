'use strict';

import _ from 'lodash';
import {APPLICATION_READ_SERVICE} from 'core/application/service/application.read.service';

let angular = require('angular');
import {ACCOUNT_SERVICE} from 'core/account/account.service';

module.exports = angular.module('spinnaker.core.cache.initializer', [
  ACCOUNT_SERVICE,
  require('../securityGroup/securityGroup.read.service.js'),
  APPLICATION_READ_SERVICE,
  require('../ci/jenkins/igor.service.js'),
  require('./infrastructureCaches.js'),
  require('./infrastructureCacheConfig.js'),
  require('../cloudProvider/cloudProvider.registry.js'),
])
  .factory('cacheInitializer', function ($q, applicationReader, infrastructureCaches,
                                         accountService, securityGroupReader, cloudProviderRegistry,
                                         igorService, infrastructureCacheConfig, serviceDelegate) {

    var initializers = {
      credentials: [() => accountService.listAccounts()],
      securityGroups: [() => securityGroupReader.getAllSecurityGroups()],
      applications: [() => applicationReader.listApplications()],
      buildMasters: [() => igorService.listMasters()],
    };

    var cacheConfig = _.cloneDeep(infrastructureCacheConfig);

    function setConfigDefaults(key, config) {
      config.version = config.version || 1;
      config.maxAge = config.maxAge || 2 * 24 * 60 * 60 * 1000;
      config.initializers = config.initializers || initializers[key] || [];
      config.onReset = config.onReset || [angular.noop];
    }

    function extendConfig() {
      Object.keys(cacheConfig).forEach((key) => {
        setConfigDefaults(key, cacheConfig[key]);
      });
      return accountService.listProviders().then((availableProviders) => {
        return cloudProviderRegistry.listRegisteredProviders().forEach((provider) => {
          if (!availableProviders.includes(provider)) {
            return;
          }
          if (serviceDelegate.hasDelegate(provider, 'cache.configurer')) {
            let providerConfig = serviceDelegate.getDelegate(provider, 'cache.configurer');
            Object.keys(providerConfig).forEach(function(key) {
              setConfigDefaults(key, providerConfig[key]);
              if (!cacheConfig[key]) {
                cacheConfig[key] = providerConfig[key];
              }
              cacheConfig[key].initializers = _.uniq((cacheConfig[key].initializers).concat(providerConfig[key].initializers));
              cacheConfig[key].onReset = _.uniq((cacheConfig[key].onReset).concat(providerConfig[key].onReset));
              cacheConfig[key].version = Math.max(cacheConfig[key].version, providerConfig[key].version);
              cacheConfig[key].maxAge = Math.min(cacheConfig[key].maxAge, providerConfig[key].maxAge);
            });
          }
        });
      });
    }

    function initialize() {
      return extendConfig().then(() => {
        var all = [];
        Object.keys(cacheConfig).forEach(function(key) {
          all.push(initializeCache(key));
        });
        return $q.all(all);
      });
    }

    function initializeCache(key) {
      infrastructureCaches.createCache(key, cacheConfig[key]);
      if (cacheConfig[key].initializers) {
        var initializer = cacheConfig[key].initializers;
        var all = [];
        initializer.forEach(function(method) {
          all.push(method());
        });
        return $q.all(all);
      }
    }

    function refreshCache(key) {
      infrastructureCaches.clearCache(key);
      return initializeCache(key);
    }

    function refreshCaches() {
      var all = [];
      Object.keys(cacheConfig).forEach(function(key) {
        all.push(refreshCache(key));
      });
      return $q.all(all);
    }

    return {
      initialize: initialize,
      refreshCaches: refreshCaches,
      refreshCache: refreshCache,
    };
  });
