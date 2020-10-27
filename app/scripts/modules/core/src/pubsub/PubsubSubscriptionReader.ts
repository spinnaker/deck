

import { API } from 'core/api';
import { IPubsubSubscription } from 'core/domain';

export class PubsubSubscriptionReader {
  public static getPubsubSubscriptions(): PromiseLike<IPubsubSubscription[]> {
    return API.one('pubsub').one('subscriptions').get();
  }
}
