import { module, IPromise } from 'angular';
import { chain, flow } from 'lodash';

import { AccountService, IAccountDetails } from 'core/account/AccountService';
import { IAutoscaler } from 'core/domain';
import { ProviderServiceDelegate, PROVIDER_SERVICE_DELEGATE } from 'core/cloudProvider/providerService.delegate';

class AutoscalerTransformer {
  public static $inject = ['providerServiceDelegate'];
  constructor(private providerServiceDelegate: ProviderServiceDelegate) {}

  public normalizeAutoscaler(autoscaler: IAutoscaler): IPromise<IAutoscaler> {
    return AccountService.getAccountDetails(autoscaler.account).then((accountDetails: IAccountDetails) => {
      return this.providerServiceDelegate
        .getDelegate<any>(
          autoscaler.provider || autoscaler.type,
          'autoscaler.transformer',
          accountDetails && accountDetails.skin,
        )
        .normalizeAutoscaler(autoscaler);
    });
  }

  public normalizeAutoscalerSet(autoscalers: IAutoscaler[]): IAutoscaler[] {
    const setNormalizers: { (autoscalers: IAutoscaler): IAutoscaler[] }[] = chain(autoscalers)
      .filter(as => this.providerServiceDelegate.hasDelegate(as.provider || as.type, 'autoscaler.setTransformer'))
      .compact()
      .map(
        as =>
          this.providerServiceDelegate.getDelegate<any>(as.provider || as.type, 'autoscaler.setTransformer')
            .normalizeAutoscalerSet,
      )
      .uniq()
      .value();

    if (setNormalizers.length) {
      return flow(...setNormalizers)(autoscalers);
    } else {
      return autoscalers;
    }
  }
}

export const CORE_AUTOSCALER_AUTOSCALER_TRANSFORMER = 'spinnaker.core.autoscaler.transformer';
module(CORE_AUTOSCALER_AUTOSCALER_TRANSFORMER, [PROVIDER_SERVICE_DELEGATE]).service(
  'autoscalerTransformer',
  AutoscalerTransformer,
);
