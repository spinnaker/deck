'use strict';

let angular = require('angular');

require('./execution.less');

module.exports = angular
  .module('spinnaker.core.delivery.group.executionGroup.execution.directive', [
    require('../../filter/executionFilter.service.js'),
    require('../../filter/executionFilter.model.js'),
    require('../../../confirmationModal/confirmationModal.service.js'),
    require('../../../navigation/urlParser.service.js'),
  ])
  .directive('execution', function() {
    return {
      restrict: 'E',
      templateUrl: require('./execution.directive.html'),
      scope: {},
      bindToController: {
        application: '=',
        execution: '=',
        standalone: '=',
      },
      controller: 'ExecutionCtrl',
      controllerAs: 'vm',
    };
  })
  .controller('ExecutionCtrl', function ($scope, $location, $stateParams, $state, urlParser,
                                         settings, ExecutionFilterModel, executionService, confirmationModalService) {

    this.pipelinesUrl = [settings.gateUrl, 'pipelines/'].join('/');

    this.showDetails = () => {
      return this.standalone === true || ( this.execution.id === $stateParams.executionId &&
        $state.includes('**.execution.**') );
    };

    this.isActive = (stageIndex) => {
      return this.showDetails() && Number($stateParams.stage) === stageIndex;
    };

    this.toggleDetails = (node) => {
      const params = { executionId: node.executionId, stage: node.index};
      if ($state.includes('**.execution', params)) {
        if (!this.standalone) {
          $state.go('^');
        }
      } else {
        if ($state.current.name.indexOf('.executions.execution') !== -1 || this.standalone) {
          $state.go('.', params);
        } else {
          $state.go('.execution', params);
        }
      }
    };

    this.getUrl = () => {
      let url = $location.absUrl();
      if (!this.standalone) {
        url = url.replace('/executions', '/executions/details');
      }
      return url;
    };

    let updateViewStateDetails = () => {
      this.viewState.activeStageId = Number($stateParams.stage);
      this.viewState.executionId = $stateParams.executionId;
    };

    $scope.$on('$stateChangeSuccess', updateViewStateDetails);

    this.viewState = {
      activeStageId: Number($stateParams.stage),
      executionId: this.execution.id,
      canTriggerPipelineManually: this.pipelineConfig,
      canConfigure: this.pipelineConfig,
      showPipelineName: ExecutionFilterModel.sortFilter.groupBy !== 'name',
    };

    this.deleteExecution = () => {
      confirmationModalService.confirm({
        header: 'Really delete execution?',
        buttonText: 'Delete',
        body: '<p>This will permanently delete the execution history.</p>',
        submitMethod: () => executionService.deleteExecution(this.application, this.execution.id).then( () => {
          if (this.standalone) {
            $state.go('^.^.executions');
          }
        })
      });
    };

    this.cancelExecution = () => {
      let hasDeployStage = this.execution.stages && this.execution.stages.some(stage => stage.type === 'deploy');
      confirmationModalService.confirm({
        header: 'Really stop execution of ' + this.execution.name + '?',
        buttonText: 'Stop running ' + this.execution.name,
        body: hasDeployStage ? '<b>Note:</b> Any deployments that have begun will continue and need to be cleaned up manually.' : null,
        submitMethod: () => executionService.cancelExecution(this.application, this.execution.id)
      });
    };

    this.pauseExecution = () => {
      confirmationModalService.confirm({
          header: 'Really pause execution?',
          buttonText: 'Pause',
          body: '<p>This will pause the pipeline for up to 12 hours.</p><p>After 12 hours the pipeline will automatically timeout and fail.</p>',
          submitMethod: () => executionService.pauseExecution(this.application, this.execution.id)
      });
    };

    this.resumeExecution = () => {
      confirmationModalService.confirm({
          header: 'Really resume execution?',
          buttonText: 'Resume',
          submitMethod: () => executionService.resumeExecution(this.application, this.execution.id)
      });
    };

    $scope.$on('$destroy', () => {
      if (this.isActive()) {
        this.hideDetails();
      }
    });

  });
