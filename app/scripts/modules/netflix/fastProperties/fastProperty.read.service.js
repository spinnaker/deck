'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.netflix.fastProperties.read.service', [
    require('../../core/api/api.service'),
    require('../../core/cache/deckCacheFactory.js'),
    require('../canary/canary.read.service')
  ])
  .factory('fastPropertyReader', function (API, canaryReadService, $q, $log) {

    function fetchForAppName(appName) {
      return API.all('fastproperties').all('application').one(appName).get();
    }

    function getPropByIdAndEnv(id, env) {
      return API.all('fastproperties').one('id', id).one('env', env).get();
    }

    function fetchImpactCountForScope(fastPropertyScope) {
      return API.all('fastproperties').all('impact').post(fastPropertyScope);
    }

    function loadPromotions() {
      return API.all('fastproperties').all('promotions').getList();
    }

    function loadPromotionsByApp(appName) {
      return API.all('fastproperties').one('promotions', appName).getList()
        .then( (promotionList) => {

          return $q.all(promotionList.map((promotion) => {
            if (promotion.canaryIds) {
              return $q.all(promotion.canaryIds.map((id) => {
                return canaryReadService.getCanaryById(id);
              }))
              .then((canaries) => {
                promotion.canaries = canaries;
                return promotion;
              });
            }
          }));
        })
        .catch((error) => $log.info('There was an issue loading promotions by app', error));

    }

    return {
      fetchForAppName: fetchForAppName,
      fetchImpactCountForScope: fetchImpactCountForScope,
      loadPromotions: loadPromotions,
      loadPromotionsByApp: loadPromotionsByApp,
      getPropByIdAndEnv: getPropByIdAndEnv
    };
  });
