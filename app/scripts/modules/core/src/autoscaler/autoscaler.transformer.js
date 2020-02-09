'use strict';

import { module } from 'angular';
import { chain, flow } from 'lodash';

import { AccountService } from 'core/account/AccountService';
import { PROVIDER_SERVICE_DELEGATE } from 'core/cloudProvider/providerService.delegate';

export const CORE_AUTOSCALER_AUTOSCALER_TRANSFORMER = 'spinnaker.core.autoscaler.transformer';
export const name = CORE_AUTOSCALER_AUTOSCALER_TRANSFORMER; // for backwards compatibility
module(CORE_AUTOSCALER_AUTOSCALER_TRANSFORMER, [PROVIDER_SERVICE_DELEGATE]).factory('autoscalerTransformer', [
  'providerServiceDelegate',
  function(providerServiceDelegate) {
    function normalizeAutoscaler(autoscaler) {
      return AccountService.getAccountDetails(autoscaler.account).then(accountDetails => {
        return providerServiceDelegate
          .getDelegate(
            autoscaler.provider || autoscaler.type,
            'autoscaler.transformer',
            accountDetails && accountDetails.skin,
          )
          .normalizeAutoscaler(autoscaler);
      });
    }

    function normalizeAutoscalerSet(autoscalers) {
      const setNormalizers = chain(autoscalers)
        .filter(as => providerServiceDelegate.hasDelegate(as.provider || as.type, 'autoscaler.setTransformer'))
        .compact()
        .map(
          as =>
            providerServiceDelegate.getDelegate(as.provider || as.type, 'autoscaler.setTransformer')
              .normalizeAutoscalerSet,
        )
        .uniq()
        .value();

      if (setNormalizers.length) {
        return flow(setNormalizers)(autoscalers);
      } else {
        return autoscalers;
      }
    }

    return {
      normalizeAutoscaler: normalizeAutoscaler,
      normalizeAutoscalerSet: normalizeAutoscalerSet,
    };
  },
]);
