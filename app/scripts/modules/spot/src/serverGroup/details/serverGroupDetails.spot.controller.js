'use strict';

import { module } from 'angular';

import {
  ConfirmationModalService,
  ServerGroupReader,
  ServerGroupWarningMessageService,
  SERVER_GROUP_WRITER,
} from '@spinnaker/core';
import UIROUTER_ANGULARJS from '@uirouter/angularjs';

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

      this.destroyServerGroup = () => {
        const serverGroup = this.serverGroup;

        const taskMonitor = {
          application: app,
          title: 'Destroying ' + serverGroup.name,
          onTaskComplete: () => {
            if ($state.includes('**.serverGroup', stateParams)) {
              $state.go('^');
            }
          },
        };

        const submitMethod = params =>
          serverGroupWriter.destroyServerGroup(serverGroup, app, { elastigroupId: serverGroup.elastigroup.id });

        const stateParams = {
          name: serverGroup.name,
          accountId: serverGroup.account,
          region: serverGroup.region,
        };

        const confirmationModalParams = {
          header: 'Really destroy ' + serverGroup.name + '?',
          buttonText: 'Destroy ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
          askForReason: true,
          platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
          platformHealthType: 'Spot',
        };

        ServerGroupWarningMessageService.addDestroyWarningMessage(app, serverGroup, confirmationModalParams);

        if (app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
          confirmationModalParams.interestingHealthProviderNames = ['Spot'];
        }

        ConfirmationModalService.confirm(confirmationModalParams);
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
