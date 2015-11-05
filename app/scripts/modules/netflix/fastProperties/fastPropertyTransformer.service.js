'use strict';

// BEN_TODO this file is spelled incorrectly

let angular = require('angular');

module.exports = angular
  .module('spinnaker.netflix.fastProperties.transformer.service', [
  ])
  .factory('fastPropertyTransformer', function(_) {

    function sortRunningPromotionsFirst(promotions) {
      var sorted = _(promotions).transform(function(result, promotion) {
        if(promotion.state === 'Running') {
          result.unshift(promotion);
        } else {
          result.push(promotion);
        }
        return true;
      }, []).value();

      return sorted;
    }

    return {
      sortRunningPromotionsFirst: sortRunningPromotionsFirst,
    };

  }).name;
