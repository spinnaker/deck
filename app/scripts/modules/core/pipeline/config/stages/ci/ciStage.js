'use strict';

let angular = require('angular');


module.exports = angular.module('spinnaker.core.pipeline.stage.ciStage', [
  require('core/ci/igor.service.js'),
  require('../../pipelineConfigProvider.js'),
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      label: 'Continuous Integration (CI)',
      description: 'Runs a CI job (Travis/Jenkins)',
      key: 'ci',
      restartable: true,
      controller: 'CIStageCtrl',
      controllerAs: 'ciStageCtrl',
      templateUrl: require('./ciStage.html'),
      executionDetailsUrl: require('./ciExecutionDetails.html'),
      executionLabelTemplateUrl: require('./ciExecutionLabel.html'),
      extraLabelLines: (stage) => {
        if (!stage.masterStage.context || !stage.masterStage.context.buildInfo) {
          return 0;
        }
        let lines = stage.masterStage.context.buildInfo.number ? 1 : 0;
        return lines + (stage.masterStage.context.buildInfo.testResults || []).length;
      },
      defaultTimeoutMs: 2 * 60 * 60 * 1000, // 2 hours
      validators: [
        { type: 'requiredField', fieldName: 'job', },
      ],
      strategy: true,
    });
  }).controller('CIStageCtrl', function($scope, stage, igorService) {

    $scope.stage = stage;
    $scope.stage.failPipeline = ($scope.stage.failPipeline === undefined ? true : $scope.stage.failPipeline);
    $scope.stage.continuePipeline = ($scope.stage.continuePipeline === undefined ? false : $scope.stage.continuePipeline);

    $scope.viewState = {
      mastersLoaded: false,
      mastersRefreshing: false,
      jobsLoaded: false,
      jobsRefreshing: false,
      failureOption: 'fail',
      markUnstableAsSuccessful: !!stage.markUnstableAsSuccessful,
      waitForCompletion: stage.waitForCompletion || stage.waitForCompletion === undefined,
    };

    // Using viewState to avoid marking pipeline as dirty if field is not set
    this.markUnstableChanged = () => stage.markUnstableAsSuccessful = $scope.viewState.markUnstableAsSuccessful;

    this.waitForCompletionChanged = () => stage.waitForCompletion = $scope.viewState.waitForCompletion;

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
      if ($scope.stage && $scope.stage.master) {
        let master = $scope.stage.master,
            job = $scope.stage.job || '';
        $scope.viewState.masterIsParameterized = master.includes('${');
        $scope.viewState.jobIsParameterized = job.includes('${');
        if ($scope.viewState.masterIsParameterized || $scope.viewState.jobIsParameterized) {
          $scope.viewState.jobsLoaded = true;
          return;
        }
        $scope.viewState.jobsLoaded = false;
        $scope.jobs = [];
        igorService.listJobsForMaster($scope.stage.master).then(function(jobs) {
          $scope.viewState.jobsLoaded = true;
          $scope.viewState.jobsRefreshing = false;
          $scope.jobs = jobs;
          if (!$scope.jobs.includes($scope.stage.job)) {
            $scope.stage.job = '';
          }
        });
        $scope.useDefaultParameters = {};
        $scope.userSuppliedParameters = {};
        $scope.jobParams = null;
      }
    }

    function updateJobConfig() {
      let stage = $scope.stage,
          view = $scope.viewState;
      if (stage && stage.master && stage.job && !view.masterIsParameterized && !view.jobIsParameterized) {
        igorService.getJobConfig($scope.stage.master, $scope.stage.job).then((config) => {
          config = config || {};
          if(!$scope.stage.parameters) {
            $scope.stage.parameters = {};
          }
          $scope.jobParams = config.parameterDefinitionList;
          $scope.userSuppliedParameters = $scope.stage.parameters;
          $scope.useDefaultParameters = {};
          let params = $scope.jobParams || [];
          params.forEach((property) => {
            if(!(property.name in $scope.stage.parameters) && (property.defaultValue !== null)) {
              $scope.useDefaultParameters[property.name] = true;
            }
          });
       });
      }
    }

    $scope.useDefaultParameters = {};
    $scope.userSuppliedParameters = {};

    this.updateParam = function(parameter) {
      if($scope.useDefaultParameters[parameter] === true) {
        delete $scope.userSuppliedParameters[parameter];
        delete $scope.stage.parameters[parameter];
      } else if($scope.userSuppliedParameters[parameter]) {
        $scope.stage.parameters[parameter] = $scope.userSuppliedParameters[parameter];
      }
    };

    initializeMasters();

    $scope.$watch('stage.master', updateJobsList);
    $scope.$watch('stage.job', updateJobConfig);

  });

