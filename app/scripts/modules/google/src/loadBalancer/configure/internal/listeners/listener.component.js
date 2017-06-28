'use strict';

import * as _ from 'lodash';
const angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.internalLoadBalancer.listener.component', [])
  .component('gceInternalLoadBalancerListener', {
    bindings: {
      loadBalancer: '<',
      subnetOptions: '<',
      listener: '<',
      deleteListener: '&',
      protocolUpdated: '&',
      index: '<',
      application: '<',
    },
    templateUrl: require('./listener.component.html'),
    controller: function () {
      this.getName = (listener, applicationName) => {
        const listenerName = [applicationName, (listener.stack || ''), (listener.detail || '')].join('-');
        return _.trimEnd(listenerName, '-');
      };

      this.updateName = (listener, appName) => {
        listener.name = this.getName(listener, appName);
      };

      this.localListenerHasSameName = () => {
        return this.loadBalancer.listeners.filter(listener => listener.name === this.listener.name).length > 1;
      };

      this.existingListenerNames = () => {
        const allRegionalListenerNames = _.chain(this.application.loadBalancers.data)
          .filter(lb => (lb.loadBalancerType === 'INTERNAL' || lb.loadBalancerType === 'NETWORK') && lb.account === this.loadBalancer.account)
          .map(lb => lb.listeners)
          .flatten()
          .map(listener => listener.name)
          .value();
        const listenersInThisLb = this.loadBalancer.listeners.map(listener => listener.name);
        return allRegionalListenerNames.filter(listener => !listenersInThisLb.includes(listener));
      };

      if (!this.listener.name) {
        this.updateName(this.listener, this.application.name);
      }

      this.onAddressSelect = (address) => {
        if (address) {
          this.listener.ipAddress = address.address;
        } else {
          this.listener.ipAddress = null;
        }
      };
    }
  });
