'use strict';

import { module } from 'angular';

import { INSTANCE_WRITE_SERVICE } from '@spinnaker/core';
import UIROUTER_ANGULARJS from '@uirouter/angularjs';

export const SPOT_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER = 'spinnaker.spot.instance.details.controller';
export const name = SPOT_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER; // for backwards compatibility
module(SPOT_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER, [UIROUTER_ANGULARJS, INSTANCE_WRITE_SERVICE]).controller(
  'spotInstanceDetailsCtrl',
  [
    '$scope',
    '$q',
    'instanceWriter',
    'app',
    'instance',
    function($scope, $q, instanceWriter, app, instance) {
      $scope.application = app;

      const initialize = app.isStandalone
        ? retrieveInstance()
        : $q.all([app.serverGroups.ready()]).then(retrieveInstance);

      initialize.then(() => {
        if (!$scope.$$destroyed && !app.isStandalone) {
          app.serverGroups.onRefresh($scope, retrieveInstance);
        }
      });

      function retrieveInstance() {
        let instanceSummary, account, region;
        if (!$scope.application.serverGroups) {
          instanceSummary = {};
          account = instance.account;
          region = instance.region;
        } else {
          $scope.application.serverGroups.data.some(serverGroup => {
            return serverGroup.instances.some(possibleInstance => {
              if (possibleInstance.id === instance.instanceId || possibleInstance.name === instance.instanceId) {
                instanceSummary = possibleInstance;
                account = serverGroup.account;
                region = serverGroup.region;
                return true;
              }
            });
          });
        }

        $scope.instance = instanceSummary;
      }
    },
  ],
);
