'use strict';

const angular = require('angular');
import _ from 'lodash';

import { INSTANCE_TYPE_SERVICE } from '@spinnaker/core';

module.exports = angular.module('spinnaker.serverGroup.configure.gce.cloneServerGroup', [
  require('@uirouter/angularjs').default,
  require('google/instance/custom/customInstanceBuilder.gce.service.js'),
  INSTANCE_TYPE_SERVICE,
  require('./hiddenMetadataKeys.value.js'),
  require('./securityGroups/tagManager.service.js')
])
  .controller('gceCloneServerGroupCtrl', function($scope, $uibModalInstance, $q, $state, $log,
                                                  serverGroupWriter, v2modalWizardService, taskMonitorBuilder,
                                                  gceServerGroupConfigurationService,
                                                  serverGroupCommand, application, title,
                                                  gceCustomInstanceBuilderService, instanceTypeService,
                                                  wizardSubFormValidation, gceServerGroupHiddenMetadataKeys,
                                                  gceTagManager) {
    $scope.pages = {
      templateSelection: require('./templateSelection/templateSelection.html'),
      basicSettings: require('./location/basicSettings.html'),
      loadBalancers: require('./loadBalancers/loadBalancers.html'),
      securityGroups: require('./securityGroups/securityGroups.html'),
      instanceType: require('./instanceType/instanceType.html'),
      capacity: require('./capacity/capacity.html'),
      zones: require('./capacity/zones.html'),
      autoHealingPolicy: require('./autoHealingPolicy/autoHealingPolicy.html'),
      advancedSettings: require('./advancedSettings/advancedSettings.html'),
    };

    $scope.title = title;

    $scope.applicationName = application.name;
    $scope.application = application;

    $scope.command = serverGroupCommand;

    $scope.state = {
      loaded: false,
      requiresTemplateSelection: !!serverGroupCommand.viewState.requiresTemplateSelection,
    };

    this.templateSelectionText = {
      copied: [
        'account, region, subnet, cluster name (stack, details)',
        'load balancers',
        'security groups',
        'instance type',
        'all fields on the Advanced Settings page',
      ],
      notCopied: [],
    };

    if (!$scope.command.viewState.disableStrategySelection) {
      this.templateSelectionText.notCopied.push('the deployment strategy (if any) used to deploy the most recent server group');
    }

    function onApplicationRefresh() {
      // If the user has already closed the modal, do not navigate to the new details view
      if ($scope.$$destroyed) {
        return;
      }
      let cloneStage = $scope.taskMonitor.task.execution.stages.find((stage) => stage.type === 'cloneServerGroup');
      if (cloneStage && cloneStage.context['deploy.server.groups']) {
        let newServerGroupName = cloneStage.context['deploy.server.groups'][$scope.command.region];
        if (newServerGroupName) {
          var newStateParams = {
            serverGroup: newServerGroupName,
            accountId: $scope.command.credentials,
            region: $scope.command.region,
            provider: 'gce',
          };
          var transitionTo = '^.^.^.clusters.serverGroup';
          if ($state.includes('**.clusters.serverGroup')) {  // clone via details, all view
            transitionTo = '^.serverGroup';
          }
          if ($state.includes('**.clusters.cluster.serverGroup')) { // clone or create with details open
            transitionTo = '^.^.serverGroup';
          }
          if ($state.includes('**.clusters')) { // create new, no details open
            transitionTo = '.serverGroup';
          }
          $state.go(transitionTo, newStateParams);
        }
      }
    }

    function onTaskComplete() {
      application.serverGroups.refresh();
      application.serverGroups.onNextRefresh($scope, onApplicationRefresh);
    }

    $scope.taskMonitor = taskMonitorBuilder.buildTaskMonitor({
      application: application,
      title: 'Creating your server group',
      modalInstance: $uibModalInstance,
      onTaskComplete: onTaskComplete,
    });

    function configureCommand() {
      gceServerGroupConfigurationService.configureCommand(application, serverGroupCommand).then(function () {
        var mode = serverGroupCommand.viewState.mode;
        if (mode === 'clone' || mode === 'create') {
          if (!serverGroupCommand.backingData.packageImages || !serverGroupCommand.backingData.packageImages.length) {
            serverGroupCommand.viewState.useAllImageSelection = true;
          }
        }
        $scope.state.loaded = true;
        initializeSelectOptions();
        initializeWatches();
        wizardSubFormValidation
          .config({ scope: $scope, form: 'form'})
          .register({ page: 'location', subForm: 'basicSettings' })
          .register({ page: 'capacity', subForm: 'capacitySubForm' })
          .register({ page: 'zones', subForm: 'zonesSubForm' })
          .register({ page: 'load-balancers', subForm: 'loadBalancerSubForm' })
          .register({ page: 'autohealing-policy', subForm: 'autoHealingPolicySubForm' });
      }).catch(e => {
        $log.error('Error generating server group command: ', e);
      });
    }

    function initializeWatches() {
      $scope.$watch('command.credentials', createResultProcessor($scope.command.credentialsChanged));
      $scope.$watch('command.regional', createResultProcessor($scope.command.regionalChanged));
      $scope.$watch('command.region', createResultProcessor($scope.command.regionChanged));
      $scope.$watch('command.network', createResultProcessor($scope.command.networkChanged));
      $scope.$watch('command.zone', createResultProcessor($scope.command.zoneChanged));
      $scope.$watch('command.viewState.instanceTypeDetails', updateStorageSettingsFromInstanceType());
      $scope.$watch('command.viewState.customInstance', () => {
        $scope.command.customInstanceChanged();
        setInstanceTypeFromCustomChoices();
      }, true);
    }

    function initializeSelectOptions() {
      processCommandUpdateResult($scope.command.credentialsChanged());
      processCommandUpdateResult($scope.command.regionalChanged());
      processCommandUpdateResult($scope.command.regionChanged());
      processCommandUpdateResult($scope.command.networkChanged());
      processCommandUpdateResult($scope.command.zoneChanged());
      processCommandUpdateResult($scope.command.customInstanceChanged());
      gceServerGroupConfigurationService.configureSubnets($scope.command);
    }

    function createResultProcessor(method) {
      return function() {
        processCommandUpdateResult(method());
      };
    }

    function processCommandUpdateResult(result) {
      if (result.dirty.loadBalancers) {
        v2modalWizardService.markDirty('load-balancers');
      }
      if (result.dirty.securityGroups) {
        v2modalWizardService.markDirty('security-groups');
      }
      if (result.dirty.availabilityZones) {
        v2modalWizardService.markDirty('capacity');
      }
      if (result.dirty.instanceType) {
        v2modalWizardService.markDirty('instance-type');
      }
    }

    function setInstanceTypeFromCustomChoices() {
      let c = $scope.command,
        location = c.regional ? c.region : c.zone,
        { locationToInstanceTypesMap } = c.backingData.credentialsKeyedByAccount[c.credentials];

      let customInstanceChoices = [
          _.get(c, 'viewState.customInstance.vCpuCount'),
          _.get(c, 'viewState.customInstance.memory'),
        ];

      if (_.every([...customInstanceChoices,
                   gceCustomInstanceBuilderService
                     .customInstanceChoicesAreValid(...customInstanceChoices, location, locationToInstanceTypesMap)])) {

        c.instanceType = gceCustomInstanceBuilderService
          .generateInstanceTypeString(...customInstanceChoices);

        instanceTypeService
          .getInstanceTypeDetails(c.selectedProvider, 'buildCustom')
          .then((instanceTypeDetails) => {
            c.viewState.instanceTypeDetails = instanceTypeDetails;
          });
      }
    }

    function updateStorageSettingsFromInstanceType() {
      return function(instanceTypeDetails) {
        if ($scope.command.viewState.initialized) {
          if (instanceTypeDetails && instanceTypeDetails.storage && instanceTypeDetails.storage.defaultSettings) {
            $scope.command.disks = instanceTypeDetails.storage.defaultSettings.disks;
            delete $scope.command.viewState.overriddenStorageDescription;
          }
        } else {
          $scope.command.viewState.initialized = true;
        }
      };
    }

    this.isValid = function () {
      return $scope.command &&
        ($scope.command.viewState.disableImageSelection || $scope.command.image) &&
        ($scope.command.application) &&
        ($scope.command.credentials) && ($scope.command.instanceType) &&
        ($scope.command.region) && ($scope.command.regional || $scope.command.zone) &&
        ($scope.command.capacity.desired !== null) &&
        $scope.form.$valid &&
        v2modalWizardService.isComplete();
    };

    this.showSubmitButton = function () {
      return v2modalWizardService.allPagesVisited();
    };

    function buildLoadBalancerMetadata(loadBalancerNames, loadBalancerIndex, backendServices) {
      let metadata = {};

      if (_.get(loadBalancerNames, 'length') > 0) {
        metadata = loadBalancerNames.reduce((metadata, name) => {
          let loadBalancerDetails = loadBalancerIndex[name];

          if (loadBalancerDetails.loadBalancerType === 'HTTP') {
            metadata['global-load-balancer-names'] =
              metadata['global-load-balancer-names']
                .concat(loadBalancerDetails.listeners.map(listener => listener.name));
          } else if (loadBalancerDetails.loadBalancerType === 'SSL') {
            metadata['global-load-balancer-names'].push(name);
          } else if (loadBalancerDetails.loadBalancerType === 'TCP') {
            metadata['global-load-balancer-names'].push(name);
          } else {
            metadata['load-balancer-names'].push(name);
          }
          return metadata;
        }, { 'load-balancer-names' : [], 'global-load-balancer-names': [] });
      }

      if (_.isObject(backendServices) && Object.keys(backendServices).length > 0) {
        metadata['backend-service-names'] = _.reduce(
          backendServices,
          (accumulatedBackends, backends) => accumulatedBackends.concat(backends),
          []);
      }

      for (let key in metadata) {
        if (metadata[key].length === 0) {
          delete metadata[key];
        } else {
          metadata[key] = _.uniq(metadata[key]).toString();
        }
      }

      return metadata;
    }

    function collectLoadBalancerNamesForCommand (loadBalancerIndex, loadBalancerMetadata) {
      let loadBalancerNames = [];
      if (loadBalancerMetadata['load-balancer-names']) {
        loadBalancerNames = loadBalancerNames.concat(loadBalancerMetadata['load-balancer-names'].split(','));
      }

      let selectedSslLoadBalancerNames = _.chain(loadBalancerIndex)
        .filter({loadBalancerType: 'SSL'})
        .map('name')
        .intersection(
          loadBalancerMetadata['global-load-balancer-names']
            ? loadBalancerMetadata['global-load-balancer-names'].split(',')
            : [])
        .value();

      let selectedTcpLoadBalancerNames = _.chain(loadBalancerIndex)
        .filter({loadBalancerType: 'TCP'})
        .map('name')
        .intersection(
          loadBalancerMetadata['global-load-balancer-names']
            ? loadBalancerMetadata['global-load-balancer-names'].split(',')
            : [])
        .value();

      return loadBalancerNames.concat(selectedSslLoadBalancerNames).concat(selectedTcpLoadBalancerNames);
    }

    this.submit = function () {
      // We use this list of load balancer names when 'Enabling' a server group.
      var loadBalancerMetadata = buildLoadBalancerMetadata(
        $scope.command.loadBalancers,
        $scope.command.backingData.filtered.loadBalancerIndex,
        $scope.command.backendServices);

      var origLoadBalancers = $scope.command.loadBalancers;
      $scope.command.loadBalancers = collectLoadBalancerNamesForCommand(
        $scope.command.backingData.filtered.loadBalancerIndex,
        loadBalancerMetadata);

      if ($scope.command.minCpuPlatform === '(Automatic)') {
        $scope.command.minCpuPlatform = '';
      }

      angular.extend($scope.command.instanceMetadata, loadBalancerMetadata);

      var origTags = $scope.command.tags;
      var transformedTags = [];
      // The tags are stored using a 'value' attribute to enable the Add/Remove behavior in the wizard.
      $scope.command.tags.forEach(function(tag) {
        transformedTags.push(tag.value);
      });
      $scope.command.tags = transformedTags;

      $scope.command.targetSize = $scope.command.capacity.desired;

      if ($scope.command.autoscalingPolicy) {
        $scope.command.capacity.min = $scope.command.autoscalingPolicy.minNumReplicas;
        $scope.command.capacity.max = $scope.command.autoscalingPolicy.maxNumReplicas;
      } else {
        $scope.command.capacity.min = $scope.command.capacity.desired;
        $scope.command.capacity.max = $scope.command.capacity.desired;
      }

      delete $scope.command.securityGroups;

      if ($scope.command.viewState.mode === 'editPipeline' || $scope.command.viewState.mode === 'createPipeline') {
        return $uibModalInstance.close($scope.command);
      }
      $scope.taskMonitor.submit(
        function() {
          var promise = serverGroupWriter.cloneServerGroup(angular.copy($scope.command), application);

          // Copy back the original objects so the wizard can still be used if the command needs to be resubmitted.
          $scope.command.instanceMetadata = _.omit($scope.command.instanceMetadata, gceServerGroupHiddenMetadataKeys);

          $scope.command.tags = origTags;
          $scope.command.loadBalancers = origLoadBalancers;
          $scope.command.securityGroups = gceTagManager.inferSecurityGroupIdsFromTags($scope.command.tags);

          return promise;
        }
      );
    };

    this.onHealthCheckRefresh = function() {
      gceServerGroupConfigurationService.refreshHttpHealthChecks($scope.command);
    };

    this.setAutoHealingPolicy = function(autoHealingPolicy) {
      $scope.command.autoHealingPolicy = autoHealingPolicy;
    };

    this.cancel = function () {
      $uibModalInstance.dismiss();
    };

    this.specialInstanceProfiles = new Set(['custom', 'buildCustom']);

    // This function is called from within React, and without $apply, Angular does not know when it has been called.
    $scope.command.setCustomInstanceViewState = (customInstanceChoices) => {
      $scope.$apply(() => $scope.command.viewState.customInstance = customInstanceChoices);
    };

    if (!$scope.state.requiresTemplateSelection) {
      configureCommand();
    } else {
      $scope.state.loaded = true;
    }

    this.templateSelected = () => {
      $scope.state.requiresTemplateSelection = false;
      configureCommand();
    };

    $scope.$on('$destroy', gceTagManager.reset);
  });
