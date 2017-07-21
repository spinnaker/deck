import { IComponentOptions, IController, module } from 'angular';
import { set } from 'lodash';
import { IGceAutoHealingPolicy } from 'google/domain/autoHealingPolicy';

class GceAutoHealingPolicySelector implements IController {
  public httpHealthChecks: string[];
  public autoHealingPolicy: IGceAutoHealingPolicy;
  public enabled: boolean;
  public viewState: {maxUnavailableMetric: 'percent' | 'fixed'};
  private setAutoHealingPolicy: Function;

  public $onInit(): void {
    if (this.autoHealingPolicy && this.autoHealingPolicy.maxUnavailable) {
      if (typeof this.autoHealingPolicy.maxUnavailable.fixed === 'number') {
        this.viewState = {maxUnavailableMetric: 'fixed'};
      } else if (typeof this.autoHealingPolicy.maxUnavailable.percent === 'number') {
        this.viewState = {maxUnavailableMetric: 'percent'};
      }
    }

    if (!this.autoHealingPolicy) {
      this.setAutoHealingPolicy({autoHealingPolicy: {initialDelaySec: 300}});
    }
  }

  public $onDestroy(): void {
    this.setAutoHealingPolicy({autoHealingPolicy: null});
  }

  public manageMaxUnavailableMetric(selectedMetric: string): void {
    if (!selectedMetric) {
      // Clouddriver deletes maxUnavailable if maxUnavailable is an empty object.
      this.autoHealingPolicy.maxUnavailable = {};
    } else {
      const toDeleteKey = selectedMetric === 'percent' ? 'fixed' : 'percent';
      set(this.autoHealingPolicy, ['maxUnavailable', toDeleteKey], undefined);
    }
  }
}

class GceAutoHealingPolicySelectorComponent implements IComponentOptions {
  public bindings: any = {
    onHealthCheckRefresh: '&',
    setAutoHealingPolicy: '&',
    httpHealthChecks: '<',
    autoHealingPolicy: '<',
    enabled: '<',
    labelColumns: '@?',
  };
  public templateUrl = require('./autoHealingPolicySelector.component.html');
  public controller: any = GceAutoHealingPolicySelector;
}

export const GCE_AUTOHEALING_POLICY_SELECTOR = 'spinnaker.gce.autoHealingPolicy.selector.component';
module(GCE_AUTOHEALING_POLICY_SELECTOR, [])
  .component('gceAutoHealingPolicySelector', new GceAutoHealingPolicySelectorComponent());

