'use strict';

import { module } from 'angular';

import {
  ConfirmationModalService,
  ServerGroupReader,
  ServerGroupWarningMessageService,
  SERVER_GROUP_WRITER,
} from '@spinnaker/core';
import UIROUTER_ANGULARJS from '@uirouter/angularjs';

//todo yossi - taken from oracle

export const SPOT_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER = 'spinnaker.spot.serverGroup.details.controller';
export const name = SPOT_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER; // for backwards compatibility
module(SPOT_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER, [UIROUTER_ANGULARJS, SERVER_GROUP_WRITER]).controller(
  'spotServerGroupDetailsCtrl',
  [
    '$scope',
    '$state',
    '$uibModal',
    'app',
    'serverGroup',
    'serverGroupWriter',
    function($scope, $state, $uibModal, app, serverGroup, serverGroupWriter) {
      const provider = 'spot';

      this.application = app;
      this.serverGroup = serverGroup;

      this.state = {
        loading: true,
      };

      /////////////////////////////////////////////////////////
      // Fetch data
      /////////////////////////////////////////////////////////

      const retrieveServerGroup = () => {
        return ServerGroupReader.getServerGroup(
          app.name,
          serverGroup.accountId,
          serverGroup.region,
          serverGroup.name,
        ).then(details => {
          cancelLoader();
          details.account = serverGroup.accountId;
          this.serverGroup = details;
        });
      };

      ////////////////////////////////////////////////////////////
      // Actions. Triggered by server group details dropdown menu
      ////////////////////////////////////////////////////////////

      this.destroyServerGroup = function destroyServerGroup() {
        const serverGroup = this.serverGroup;
        const taskMonitor = {
          application: app,
          title: 'Destroying ' + serverGroup.name,
          onTaskComplete: function() {
            if ($state.includes('**.serverGroup', stateParams)) {
              $state.go('^');
            }
          },
        };

        const submitMethod = function() {
          return serverGroupWriter.destroyServerGroup(serverGroup, app);
        };

        const stateParams = {
          name: serverGroup.name,
          account: serverGroup.account,
          region: serverGroup.region,
        };

        ConfirmationModalService.confirm({
          header: 'Really destroy ' + serverGroup.name + '?',
          buttonText: 'Destroy ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.resizeServerGroup = () => {
        $uibModal.open({
          templateUrl: require('./resize/resizeServerGroup.html'),
          controller: 'spotResizeServerGroupCtrl as ctrl',
          resolve: {
            serverGroup: () => this.serverGroup,
            application: () => app,
          },
        });
      };

      //todo yossi not been tested
      this.disableServerGroup = () => {
        const serverGroup = this.serverGroup;

        const taskMonitor = {
          application: app,
          title: 'Disabling ' + serverGroup.name,
        };

        const submitMethod = params => serverGroupWriter.disableServerGroup(serverGroup, app, params);

        const confirmationModalParams = {
          header: 'Really disable ' + serverGroup.name + '?',
          buttonText: 'Disable ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
          platformHealthType: 'Spot',
          submitMethod: submitMethod,
          askForReason: true,
        };

        ServerGroupWarningMessageService.addDisableWarningMessage(app, serverGroup, confirmationModalParams);

        if (app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
          confirmationModalParams.interestingHealthProviderNames = ['Spot'];
        }

        ConfirmationModalService.confirm(confirmationModalParams);
      };

      //todo yossi not been tested
      this.enableServerGroup = () => {
        const serverGroup = this.serverGroup;

        const taskMonitor = {
          application: app,
          title: 'Enabling ' + serverGroup.name,
        };

        const submitMethod = params => serverGroupWriter.enableServerGroup(serverGroup, app, params);

        const confirmationModalParams = {
          header: 'Really enable ' + serverGroup.name + '?',
          buttonText: 'Enable ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
          platformHealthType: 'Spot',
          submitMethod: submitMethod,
          askForReason: true,
        };

        if (app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
          confirmationModalParams.interestingHealthProviderNames = ['Spot'];
        }

        ConfirmationModalService.confirm(confirmationModalParams);
      };

      const cancelLoader = () => {
        this.state.loading = false;
      };

      retrieveServerGroup().then(() => {
        if (!$scope.$$destroyed) {
          app.serverGroups.onRefresh($scope, retrieveServerGroup);
        }
      });
    },
  ],
);
