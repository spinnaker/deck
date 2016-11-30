'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.serverGroup.details.multipleServerGroups.controller', [
    require('angular-ui-router'),
    require('../serverGroup.write.service'),
    require('../serverGroup.submit.service'),
    require('../../confirmationModal/confirmationModal.service'),
    require('../../insight/insightFilterState.model'),
    require('../../cluster/filter/multiselect.model'),
    require('../../cloudProvider/serviceDelegate.service.js'),
    require('./multipleServerGroup.component'),
  ])
  .controller('MultipleServerGroupsCtrl', function ($scope, $state, InsightFilterStateModel,
                                                    confirmationModalService, MultiselectModel,
                                                    serverGroupWriter, serverGroupSubmitter, serviceDelegate, app) {

      this.InsightFilterStateModel = InsightFilterStateModel;
      this.serverGroups = [];

      /**
       * Actions
       */

      let getDescriptor = () => {
        let descriptor = this.serverGroups.length + ' server group';
        if (this.serverGroups.length > 1) {
          descriptor += 's';
        }
        return descriptor;
      };

      let confirm = (submitMethodName, verbs) => {
        let descriptor = getDescriptor(),
            monitorInterval = this.serverGroups.length * 1000;
        let taskMonitors = this.serverGroups.map(serverGroup => {
          let provider = serverGroup.provider || serverGroup.type;
          let submitter = serviceDelegate.hasDelegate(provider, 'serverGroup.submitter') ?
            serviceDelegate.getDelegate(provider, 'serverGroup.submitter') :
            serverGroupSubmitter;

          let submitMethod = submitter[submitMethodName] || serverGroupSubmitter[submitMethodName];

          return {
            application    : app,
            title          : serverGroup.name,
            submitMethod   : submitMethod(serverGroup, app),
            monitorInterval: monitorInterval,
          };
        });

        confirmationModalService.confirm({
          header           : 'Really ' + verbs.simplePresent.toLowerCase() + ' ' + descriptor + '?',
          buttonText       : verbs.simplePresent + ' ' + descriptor,
          verificationLabel: 'Verify the number of server groups (<span class="verification-text">' + this.serverGroups.length + '</span>) to be ' + verbs.futurePerfect.toLowerCase(),
          textToVerify     : this.serverGroups.length + '',
          taskMonitors     : taskMonitors,
          askForReason     : true,
          multiTaskTitle   : verbs.presentContinuous + ' ' + descriptor,
        });
      };

      this.destroyServerGroups = () => {
        confirm('destroyServerGroup', {
          presentContinuous: 'Destroying',
          simplePresent    : 'Destroy',
          futurePerfect    : 'Destroyed'
        });
      };

      this.disableServerGroups = () => {
        confirm('disableServerGroup', {
          presentContinuous: 'Disabling',
          simplePresent    : 'Disable',
          futurePerfect    : 'Disabled'
        });
      };

      this.enableServerGroups = () => {
        confirm('enableServerGroup', {
          presentContinuous: 'Enabling',
          simplePresent    : 'Enable',
          futurePerfect    : 'Enabled'
        });
      };

      this.canDisable = () => this.serverGroups.every((group) => !group.disabled);

      this.canEnable = () => this.serverGroups.every((group) => group.disabled);

      /***
       * View instantiation/synchronization
       */

      let retrieveServerGroups = () => {
        this.serverGroups = MultiselectModel.serverGroups.map(multiselectGroup => {
          let group = _.cloneDeep(multiselectGroup);
          let match = app.serverGroups.data.find(check => check.name === group.name && check.account === group.account && check.region === group.region);
          if (match) {
            group.instanceCounts = _.cloneDeep(match.instanceCounts);
            group.disabled = match.isDisabled;
          }
          return group;
        });
      };

      let multiselectWatcher = MultiselectModel.serverGroupsStream.subscribe(retrieveServerGroups);
      app.serverGroups.onRefresh($scope, retrieveServerGroups);

      retrieveServerGroups();

      $scope.$on('$destroy', () => {
        if (this.serverGroups.length !== 1) {
          MultiselectModel.clearAllServerGroups();
        }
        multiselectWatcher.unsubscribe();
      });

    }
  );
