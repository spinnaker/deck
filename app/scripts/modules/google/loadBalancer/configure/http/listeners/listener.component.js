'use strict';

import * as _ from 'lodash';
import {GCE_ADDRESS_SELECTOR} from 'google/loadBalancer/configure/common/addressSelector.component';
const angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.listener.component', [GCE_ADDRESS_SELECTOR])
  .component('gceListener', {
    bindings: {
      command: '=',
      listener: '=',
      deleteListener: '&',
      index: '=',
      application: '=',
    },
    templateUrl: require('./listener.component.html'),
    controller: function () {
      this.certificates = this.command.backingData.certificates;
      let loadBalancerMap = this.command.backingData.loadBalancerMap;

      this.getName = (listener, applicationName) => {
        let listenerName = [applicationName, (listener.stack || ''), (listener.detail || '')].join('-');
        return _.trimEnd(listenerName, '-');
      };

      this.getCertificates = () => {
        return this.command.backingData.certificates
          .filter((certificate) => certificate.account === this.command.loadBalancer.credentials)
          .map((certificate) => certificate.name);
      };

      this.updateName = (listener, appName) => {
        listener.name = this.getName(listener, appName);
      };

      this.localListenerHasSameName = () => {
        return this.command.loadBalancer.listeners.filter(listener => listener.name === this.listener.name).length > 1;
      };

      this.existingListenerNames = () => {
        return _.get(loadBalancerMap, [this.command.loadBalancer.credentials, 'listeners']);
      };

      this.isHttps = (port) => port === 443 || port === '443';

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
