'use strict';

let angular = require('angular');
import {SERVICE_ACCOUNT_SERVICE} from 'core/serviceAccount/serviceAccount.service.ts';

module.exports = angular.module('spinnaker.core.pipeline.config.trigger.ci', [
  require('./ciTriggerOptions.directive.js'),
  require('../trigger.directive.js'),
  require('core/ci/igor.service.js'),
  SERVICE_ACCOUNT_SERVICE,
  require('../../pipelineConfigProvider.js'),
])
  .config(function(pipelineConfigProvider) {

    pipelineConfigProvider.registerTrigger({
      label: 'Continuous Integration',
      description: 'Listens to a CI job (Jenkins/Travis)',
      key: 'ci',
      controller: 'CITriggerCtrl',
      controllerAs: 'ciTriggerCtrl',
      templateUrl: require('./ciTrigger.html'),
      popoverLabelUrl: require('./ciPopoverLabel.html'),
      manualExecutionHandler: 'ciTriggerExecutionHandler',
      validators: [
        {
          type: 'requiredField',
          fieldName: 'job',
          message: '<strong>Job</strong> is a required field on CI triggers.',
        },
        {
          type: 'serviceAccountAccess',
          message: `You do not have access to the service account configured in this pipeline's Continuous Integration trigger.
                    You will not be able to save your edits to this pipeline.`,
          preventSave: true,
        }
      ],
    });
  })
  .factory('ciTriggerExecutionHandler', function ($q) {
    // must provide two fields:
    //   formatLabel (promise): used to supply the label for selecting a trigger when there are multiple triggers
    //   selectorTemplate: provides the HTML to show extra fields
    return {
      formatLabel: (trigger) => {
        return $q.when(`(CI) ${trigger.master}: ${trigger.job}`);
      },
      selectorTemplate: require('./selectorTemplate.html'),
    };
  })
  .controller('CITriggerCtrl', function($scope, trigger, igorService, settings, serviceAccountService) {

    $scope.trigger = trigger;
    this.fiatEnabled = settings.feature.fiatEnabled;
    serviceAccountService.getServiceAccounts().then(accounts => {
      this.serviceAccounts = accounts || [];
    });

    $scope.viewState = {
      mastersLoaded: false,
      mastersRefreshing: false,
      jobsLoaded: false,
      jobsRefreshing: false,
    };

    function initializeMasters() {
      igorService.listMasters().then(function (masters) {
        $scope.masters = masters;
        $scope.viewState.mastersLoaded = true;
        $scope.viewState.mastersRefreshing = false;
      });
    }

    this.refreshMasters = function() {
      $scope.viewState.mastersRefreshing = true;
      initializeMasters();
    };

    this.refreshJobs = function() {
      $scope.viewState.jobsRefreshing = true;
      updateJobsList();
    };

    function updateJobsList() {
      if ($scope.trigger && $scope.trigger.master) {
        $scope.viewState.jobsLoaded = false;
        $scope.jobs = [];
        igorService.listJobsForMaster($scope.trigger.master).then(function(jobs) {
          $scope.viewState.jobsLoaded = true;
          $scope.viewState.jobsRefreshing = false;
          $scope.jobs = jobs;
          if (jobs.length && !$scope.jobs.includes($scope.trigger.job)) {
            $scope.trigger.job = '';
          }
        });
      }
    }

    initializeMasters();

    $scope.$watch('trigger.master', updateJobsList);

  });
