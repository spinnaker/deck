'use strict';

const angular = require('angular');

import {EXECUTION_FILTER_MODEL} from 'core/delivery/filter/executionFilter.model';
import {EXECUTION_FILTER_SERVICE} from 'core/delivery/filter/executionFilter.service';
import {EXECUTION_SERVICE} from '../service/execution.service';
import {INSIGHT_NGMODULE} from 'core/insight/insight.module';
import {PIPELINE_CONFIG_SERVICE} from 'core/pipeline/config/services/pipelineConfig.service';
import {SCROLL_TO_SERVICE} from '../../utils/scrollTo/scrollTo.service';

module.exports = angular.module('spinnaker.core.delivery.executions.controller', [
  EXECUTION_SERVICE,
  PIPELINE_CONFIG_SERVICE,
  SCROLL_TO_SERVICE,
  INSIGHT_NGMODULE.name,
  EXECUTION_FILTER_MODEL,
  EXECUTION_FILTER_SERVICE,
  require('../create/create.module.js'),
])
  .controller('ExecutionsCtrl', function($scope, $state, $q, $uibModal, $stateParams,
                                         pipelineConfigService, scrollToService, $timeout,
                                         executionService, executionFilterModel, executionFilterService,
                                         insightFilterStateModel) {

    this.$onInit = () => {
      const { application } = this;
      const groupsUpdatedSubscription = executionFilterService.groupsUpdatedStream.subscribe(() => this.groupsUpdated());
      if (executionFilterModel.mostRecentApplication !== application.name) {
        executionFilterModel.groups = [];
        executionFilterModel.mostRecentApplication = application.name;
      }

      let scrollIntoView = (delay = 200) => scrollToService.scrollTo('#execution-' + $stateParams.executionId, '.all-execution-groups', 225, delay);

      if (application.notFound) {
        return;
      }

      application.setActiveState(application.executions);
      $scope.$on('$destroy', () => {
        application.setActiveState();
        application.executions.deactivate();
        application.pipelineConfigs.deactivate();
        groupsUpdatedSubscription.unsubscribe();
      });

      this.viewState = {
        loading: true,
        triggeringExecution: false,
      };

      application.executions.activate();
      application.pipelineConfigs.activate();

      application.executions.onRefresh($scope, () => {
        // if an execution was selected but is no longer present, navigate up
        if ($state.params.executionId) {
          if (application.getDataSource('executions').data.every(e => e.id !== $state.params.executionId)) {
            $state.go('.^');
          }
        }
      });

      $q.all([application.executions.ready(), application.pipelineConfigs.ready()]).then(() => {
        this.updateExecutionGroups();
        if ($stateParams.executionId) {
          scrollIntoView();
        }
      });

      application.executions.onRefresh($scope, normalizeExecutionNames, dataInitializationFailure);

      $scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
        // if we're navigating to a different execution on the same page, scroll the new execution into view
        // or, if we are navigating back to the same execution after scrolling down the page, scroll it into view
        // but don't scroll it into view if we're navigating to a different stage in the same execution
        let shouldScroll = false;
        if (toState.name.indexOf(fromState.name) === 0 && toParams.application === fromParams.application && toParams.executionId) {
          shouldScroll = true;
          if (toParams.executionId === fromParams.executionId && toParams.details) {
            if (toParams.stage !== fromParams.stage || toParams.step !== fromParams.step || toParams.details !== fromParams.details) {
              shouldScroll = false;
            }
          }
        }
        if (shouldScroll) {
          scrollIntoView(0);
        }
      });
    };

    this.insightFilterStateModel = insightFilterStateModel;

    this.executionFilterModel = executionFilterModel;
    this.filter = executionFilterModel.sortFilter;

    this.clearFilters = () => {
      executionFilterService.clearFilters();
      this.updateExecutionGroups(true);
    };

    this.forceUpdateExecutionGroups = () => this.updateExecutionGroups(true);

    this.updateExecutionGroups = (reload) => {
      normalizeExecutionNames();
      if (reload) {
        this.application.executions.refresh(true);
        this.application.executions.reloadingForFilters = true;
      } else {
        executionFilterService.updateExecutionGroups(this.application);
        this.groupsUpdated();
        // updateExecutionGroups is debounced by 25ms, so we need to delay setting the loading flag a bit
        $timeout(() => { this.viewState.loading = false; }, 50);
      }
    };

    this.groupsUpdated = () => {
      $scope.$applyAsync(() => {
        this.tags = executionFilterModel.tags;
      });
    };

    $scope.filterCountOptions = [1, 2, 5, 10, 20, 30, 40, 50];

    let dataInitializationFailure = () => {
      this.viewState.loading = false;
      this.viewState.initializationError = true;
    };

    let normalizeExecutionNames = () => {
      if (this.application.executions.loadFailure) {
        dataInitializationFailure();
      }
      const executions = this.application.executions.data || [];
      const configurations = this.application.pipelineConfigs.data || [];
      executions.forEach(function(execution) {
        if (execution.pipelineConfigId) {
          var configMatches = configurations.filter(function(configuration) {
            return configuration.id === execution.pipelineConfigId;
          });
          if (configMatches.length) {
            execution.name = configMatches[0].name;
          }
        }
      });
    };

    this.toggleExpansion = (expand) => {
      this.executionFilterModel.expandSubject.next(expand);
    };


    let startPipeline = (command) => {
      this.viewState.triggeringExecution = true;
      return pipelineConfigService.triggerPipeline(this.application.name, command.pipelineName, command.trigger).then(
        (newPipelineId) => {
          var monitor = executionService.waitUntilNewTriggeredPipelineAppears(this.application, newPipelineId);
          monitor.then(() => {
            this.viewState.triggeringExecution = false;
          });
          this.viewState.poll = monitor;
        },
        () => {
          this.viewState.triggeringExecution = false;
        });
    };

    this.triggerPipeline = () => {
      $uibModal.open({
        templateUrl: require('../manualExecution/manualPipelineExecution.html'),
        controller: 'ManualPipelineExecutionCtrl as vm',
        resolve: {
          pipeline: () => null,
          application: () => this.application,
        }
      }).result.then(startPipeline);
    };
  });
