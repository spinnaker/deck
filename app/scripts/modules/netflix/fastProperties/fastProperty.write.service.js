'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.netflix.fastProperties.write.service', [
    require('../../core/api/api.service'),
    require('../../core/utils/lodash.js'),
    require('../../core/authentication/authentication.service.js')
  ])
  .factory('fastPropertyWriter', function (API, authenticationService, _) {

    function upsertFastProperty(fastProperty) {
      //var payload = createPromotedPayload(fastProperty);
      fastProperty.updatedBy = authenticationService.getAuthenticatedUser().name;
      fastProperty.sourceOfUpdate = 'spinnaker';
      return API
        .all('fastproperties')
        .all('promote')
        .post(fastProperty);
    }

    function deleteFastProperty(fastProperty) {
      return API.all('fastproperties')
        .all('delete')
        .remove({
          propId: fastProperty.propertyId,
          cmcTicket: fastProperty.cmcTicket,
          env: fastProperty.env || 'prod',
        });
    }

    function continuePromotion(promotionId) {
      return API.all('fastproperties')
        .one('promote', promotionId)
        .withParams({pass:true})
        .put();
    }

    function stopPromotion(promotionId) {
      return API.all('fastproperties')
        .one('promote', promotionId)
        .withParams({pass:true})
        .put();
    }

    function deletePromotion(promotionId) {
      return API.all('fastproperties')
        .all('promote')
        .withParams({promotionId: promotionId})
        .remove();
    }

    function createPromotedPayload(fastProperty) {
      return _(fastProperty)
        .chain()
        .set('scope', fastProperty.selectedScope)
        .assign(fastProperty.scope, {sourceOfUpdate: 'spinnaker', updatedBy: authenticationService.getAuthenticatedUser().name})
        .omit(['selectedScope', 'impactCount'])
        .value();
    }

    function flattenFastProperty(fastProperty) {
      return _(fastProperty)
        .chain()
        .assign(fastProperty, fastProperty.selectedScope)
        .assign(fastProperty, {sourceOfUpdate: 'spinnaker', updatedBy: authenticationService.getAuthenticatedUser().name})
        .omit('selectedScope')
        .omit('impactCount')
        .value();
    }

    function extractScopeIntoSelectedScope(fastProperty) {
      var scopeProps = _.pick(fastProperty, [
        'env',
        'appId',
        'region',
        'asg',
        'stack',
        'serverId',
        'zone',
        'cluster',
      ]);
      return _.set(fastProperty, 'selectedScope', scopeProps);
    }


    return {
      upsertFastProperty: upsertFastProperty,
      deleteFastProperty: deleteFastProperty,
      flattenFastProperty: flattenFastProperty,
      createPromotedPayload: createPromotedPayload,
      extractScopeIntoSelectedScope: extractScopeIntoSelectedScope,
      continuePromotion: continuePromotion,
      stopPromotion: stopPromotion,
      deletePromotion: deletePromotion,
    };
  });
