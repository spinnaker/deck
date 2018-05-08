import { module, IPromise } from 'angular';

import { API } from 'core/api/ApiService';
import { IPubsubSubscription } from 'core/domain';

export class PubsubSubscriptionService {
  public getPubsubSubscriptions(): IPromise<IPubsubSubscription[]> {
    return API.one('pubsub')
      .one('subscriptions')
      .get();
  }
}

export const PUBSUB_SUBSCRIPTION_SERVICE = 'spinnaker.core.pubsubSubscription.service';
module(PUBSUB_SUBSCRIPTION_SERVICE, []).service('pubsubSubscriptionService', PubsubSubscriptionService);
