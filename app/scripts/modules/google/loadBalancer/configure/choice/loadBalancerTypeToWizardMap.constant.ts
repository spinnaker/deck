import {module} from 'angular';

interface IGceLoadBalancerWizardConfig {
  label: string;
  createTemplateUrl: string;
  editTemplateUrl: string;
  controller: string;
}

export interface IGceLoadBalancerToWizardMap {
  [loadBalancerType: string]: IGceLoadBalancerWizardConfig;
}

const loadBalancerTypeToWizardMap: IGceLoadBalancerToWizardMap = {
  'NETWORK': {
    label: 'Network',
    createTemplateUrl: require('../network/createLoadBalancer.html'),
    editTemplateUrl: require('../network/editLoadBalancer.html'),
    controller: 'gceCreateLoadBalancerCtrl'
  },
  'HTTP': {
    label: 'HTTP(S)',
    createTemplateUrl: require('../http/createHttpLoadBalancer.html'),
    editTemplateUrl: require('../http/editHttpLoadBalancer.html'),
    controller: 'gceCreateHttpLoadBalancerCtrl'
  },
  'INTERNAL': {
    label: 'Internal',
    createTemplateUrl: require('../common/commonCreateLoadBalancer.html'),
    editTemplateUrl: require('../common/commonEditLoadBalancer.html'),
    controller: 'gceInternalLoadBalancerCtrl'
  },
  'SSL': {
    label: 'SSL',
    createTemplateUrl: require('../common/commonCreateLoadBalancer.html'),
    editTemplateUrl: require('../common/commonEditLoadBalancer.html'),
    controller: 'gceSslLoadBalancerCtrl'
  },
};

export const GCE_LOAD_BALANCER_TYPE_TO_WIZARD_CONSTANT = 'spinnaker.gce.loadBalancerTypeToWizard.constant';

module(GCE_LOAD_BALANCER_TYPE_TO_WIZARD_CONSTANT, [])
  .constant('loadBalancerTypeToWizardMap', loadBalancerTypeToWizardMap);
