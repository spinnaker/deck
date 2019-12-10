'use strict';

import { module } from 'angular';

import {
  CONFIRMATION_MODAL_SERVICE,
  NetworkReader,
  ServerGroupReader,
  ServerGroupWarningMessageService,
  SERVER_GROUP_WRITER,
  SubnetReader,
} from '@spinnaker/core';
import { ORACLE_IMAGE_IMAGE_READER } from '../../image/image.reader';
import { ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER } from './resize/resizeServerGroup.controller';
import { ORACLE_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER } from './rollback/rollbackServerGroup.controller';
import UIROUTER_ANGULARJS from '@uirouter/angularjs';

export const ORACLE_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER =
  'spinnaker.oracle.serverGroup.details.controller';
export const name = ORACLE_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER; // for backwards compatibility
module(ORACLE_SERVERGROUP_DETAILS_SERVERGROUPDETAILS_CONTROLLER, [
  UIROUTER_ANGULARJS,
  CONFIRMATION_MODAL_SERVICE,
  SERVER_GROUP_WRITER,
  ORACLE_IMAGE_IMAGE_READER,
  ORACLE_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER,
  ORACLE_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER,
]).controller('oracleServerGroupDetailsCtrl', [
  '$scope',
  '$state',
  '$uibModal',
  'app',
  'serverGroup',
  'confirmationModalService',
  'serverGroupWriter',
  'oracleImageReader',
  function(
    $scope,
    $state,
    $uibModal,
    app,
    serverGroup,
    confirmationModalService,
    serverGroupWriter,
    oracleImageReader,
  ) {
    const provider = 'oracle';

    this.application = app;
    this.serverGroup = serverGroup;

    this.state = {
      loading: true,
    };

    /////////////////////////////////////////////////////////
    // Fetch data
    /////////////////////////////////////////////////////////

    let retrieveServerGroup = () => {
      return ServerGroupReader.getServerGroup(
        app.name,
        serverGroup.accountId,
        serverGroup.region,
        serverGroup.name,
      ).then(details => {
        cancelLoader();
        details.account = serverGroup.accountId;
        this.serverGroup = details;
        retrieveNetwork();
        retrieveSubnet();
        retrieveImage();
      });
    };

    let retrieveNetwork = () => {
      NetworkReader.listNetworksByProvider(provider).then(networks => {
        this.serverGroup.network = _.chain(networks)
          .filter({ account: this.serverGroup.account, id: this.serverGroup.launchConfig.vpcId })
          .head()
          .value();
      });
    };

    let retrieveSubnet = () => {
      SubnetReader.getSubnetByIdAndProvider(this.serverGroup.launchConfig.subnetId, provider).then(subnet => {
        this.serverGroup.subnet = subnet;
      });
    };

    let retrieveImage = () => {
      oracleImageReader
        .getImage(this.serverGroup.launchConfig.imageId, this.serverGroup.region, this.serverGroup.account)
        .then(image => {
          if (!image) {
            image = { id: this.serverGroup.launchConfig.imageId, name: this.serverGroup.launchConfig.imageId };
          }
          this.serverGroup.image = image;
        });
    };

    ////////////////////////////////////////////////////////////
    // Actions. Triggered by server group details dropdown menu
    ////////////////////////////////////////////////////////////

    this.destroyServerGroup = function destroyServerGroup() {
      let serverGroup = this.serverGroup;
      let taskMonitor = {
        application: app,
        title: 'Destroying ' + serverGroup.name,
      };

      let submitMethod = function() {
        return serverGroupWriter.destroyServerGroup(serverGroup, app);
      };

      let stateParams = {
        name: serverGroup.name,
        account: serverGroup.account,
        region: serverGroup.region,
      };

      confirmationModalService.confirm({
        header: 'Really destroy ' + serverGroup.name + '?',
        buttonText: 'Destroy ' + serverGroup.name,
        account: serverGroup.account,
        provider: provider,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
        onTaskComplete: function() {
          if ($state.includes('**.serverGroup', stateParams)) {
            $state.go('^');
          }
        },
      });
    };

    this.resizeServerGroup = () => {
      $uibModal.open({
        templateUrl: require('./resize/resizeServerGroup.html'),
        controller: 'oracleResizeServerGroupCtrl as ctrl',
        resolve: {
          serverGroup: () => {
            return this.serverGroup;
          },
          application: () => {
            return app;
          },
        },
      });
    };

    this.rollbackServerGroup = () => {
      $uibModal.open({
        templateUrl: require('./rollback/rollbackServerGroup.html'),
        controller: 'oracleRollbackServerGroupCtrl as ctrl',
        resolve: {
          serverGroup: () => this.serverGroup,
          disabledServerGroups: () => {
            let sgSummary = _.find(app.serverGroups.data, {
              name: this.serverGroup.name,
              account: this.serverGroup.account,
              region: this.serverGroup.region,
            });
            let cluster = _.find(app.clusters, { name: sgSummary.cluster, account: this.serverGroup.account });
            return _.filter(cluster.serverGroups, { isDisabled: true, region: this.serverGroup.region });
          },
          application: () => app,
        },
      });
    };

    this.disableServerGroup = () => {
      let serverGroup = this.serverGroup;

      let taskMonitor = {
        application: app,
        title: 'Disabling ' + serverGroup.name,
      };

      let submitMethod = params => serverGroupWriter.disableServerGroup(serverGroup, app, params);

      let confirmationModalParams = {
        header: 'Really disable ' + serverGroup.name + '?',
        buttonText: 'Disable ' + serverGroup.name,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: 'Oracle',
        submitMethod: submitMethod,
        askForReason: true,
      };

      ServerGroupWarningMessageService.addDisableWarningMessage(app, serverGroup, confirmationModalParams);

      if (app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
        confirmationModalParams.interestingHealthProviderNames = ['Oracle'];
      }

      confirmationModalService.confirm(confirmationModalParams);
    };

    this.enableServerGroup = () => {
      let serverGroup = this.serverGroup;

      let taskMonitor = {
        application: app,
        title: 'Enabling ' + serverGroup.name,
      };

      let submitMethod = params => serverGroupWriter.enableServerGroup(serverGroup, app, params);

      let confirmationModalParams = {
        header: 'Really enable ' + serverGroup.name + '?',
        buttonText: 'Enable ' + serverGroup.name,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: 'Oracle',
        submitMethod: submitMethod,
        askForReason: true,
      };

      if (app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
        confirmationModalParams.interestingHealthProviderNames = ['Oracle'];
      }

      confirmationModalService.confirm(confirmationModalParams);
    };

    let cancelLoader = () => {
      this.state.loading = false;
    };

    retrieveServerGroup().then(() => {
      if (!$scope.$$destroyed) {
        app.serverGroups.onRefresh($scope, retrieveServerGroup);
      }
    });
  },
]);
