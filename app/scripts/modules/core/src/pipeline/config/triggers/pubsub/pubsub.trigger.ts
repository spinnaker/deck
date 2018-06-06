import { IController, module } from 'angular';

import { IPubsubSubscription, IPubsubTrigger } from 'core/domain';
import { PubsubSubscriptionReader } from 'core/pubsub';
import { Registry } from 'core/registry';
import { ServiceAccountReader } from 'core/serviceAccount';
import { SETTINGS } from 'core/config/settings';

class PubsubTriggerController implements IController {
  public pubsubSystems = SETTINGS.pubsubProviders || ['google']; // TODO(joonlim): Add amazon once it is confirmed that amazon pub/sub works.
  private pubsubSubscriptions: IPubsubSubscription[];
  public filteredPubsubSubscriptions: string[];
  public subscriptionsLoaded = false;
  public serviceAccounts: string[];

  constructor(public trigger: IPubsubTrigger) {
    'ngInject';

    this.subscriptionsLoaded = false;
    this.refreshPubsubSubscriptions();
    ServiceAccountReader.getServiceAccounts().then(accounts => {
      this.serviceAccounts = accounts || [];
    });
  }

  // If we ever need a refresh button in pubsubTrigger.html, call this function.
  public refreshPubsubSubscriptions(): void {
    PubsubSubscriptionReader.getPubsubSubscriptions()
      .then(subscriptions => (this.pubsubSubscriptions = subscriptions))
      .catch(() => (this.pubsubSubscriptions = []))
      .finally(() => {
        this.subscriptionsLoaded = true;
        this.updateFilteredPubsubSubscriptions();
      });
  }

  public updateFilteredPubsubSubscriptions(): void {
    this.filteredPubsubSubscriptions = this.pubsubSubscriptions
      .filter(subscription => subscription.pubsubSystem === this.trigger.pubsubSystem)
      .map(subscription => subscription.subscriptionName);
  }
}

export const PUBSUB_TRIGGER = 'spinnaker.core.pipeline.trigger.pubsub';
module(PUBSUB_TRIGGER, [])
  .config(() => {
    Registry.pipeline.registerTrigger({
      label: 'Pub/Sub',
      description: 'Executes the pipeline when a pubsub message is received',
      key: 'pubsub',
      controller: 'PubsubTriggerCtrl',
      controllerAs: 'vm',
      templateUrl: require('./pubsubTrigger.html'),
      validators: [],
    });
  })
  .controller('PubsubTriggerCtrl', PubsubTriggerController);
