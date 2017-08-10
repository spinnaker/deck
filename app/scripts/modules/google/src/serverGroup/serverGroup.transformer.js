'use strict';

import {defaults} from 'lodash';
import {GCE_HTTP_LOAD_BALANCER_UTILS} from 'google/loadBalancer/httpLoadBalancerUtils.service';

const angular = require('angular');

module.exports = angular.module('spinnaker.gce.serverGroup.transformer', [GCE_HTTP_LOAD_BALANCER_UTILS])
  .factory('gceServerGroupTransformer', function (gceHttpLoadBalancerUtils) {

    function normalizeServerGroup(serverGroup, application) {
      return application.getDataSource('loadBalancers').ready().then(() => {
        if (serverGroup.loadBalancers) {
          // At this point, the HTTP(S) load balancers have been normalized (listener names mapped to URL map names).
          // Our server groups' lists of load balancer names still need to make this mapping.
          serverGroup.loadBalancers = gceHttpLoadBalancerUtils.normalizeLoadBalancerNamesForAccount(
            serverGroup.loadBalancers,
            serverGroup.account,
            application.getDataSource('loadBalancers').data);
        }
        return serverGroup;
      });
    }

    function convertServerGroupCommandToDeployConfiguration(base) {
      var truncatedZones = base.backingData.filtered.truncatedZones;

      // use defaults to avoid copying the backingData, which is huge and expensive to copy over
      var command = defaults({backingData: [], viewState: []}, base);
      if (base.viewState.mode !== 'clone') {
        delete command.source;
      }
      // We took this approach to avoid a breaking change to existing pipelines.
      command.disableTraffic = !command.enableTraffic;
      command.cloudProvider = 'gce';
      command.availabilityZones = {};
      command.availabilityZones[command.region] = base.zone ? [base.zone] : truncatedZones;
      command.account = command.credentials;
      delete command.viewState;
      delete command.backingData;
      delete command.selectedProvider;
      delete command.implicitSecurityGroups;
      delete command.enableTraffic;
      delete command.providerType;
      delete command.enableAutoHealing;

      return command;
    }

    return {
      convertServerGroupCommandToDeployConfiguration: convertServerGroupCommandToDeployConfiguration,
      normalizeServerGroup: normalizeServerGroup,
    };

  });
