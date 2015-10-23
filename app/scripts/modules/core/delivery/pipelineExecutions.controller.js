'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.delivery.pipelineExecutions.controller', [
  require('./execution.service.js'),
  require('../pipeline/config/services/pipelineConfigService.js'),
  require('../utils/scrollTo/scrollTo.service.js'),
  require('../cache/collapsibleSectionStateCache.js'),
  require('../cache/viewStateCache.js'),
])
  .controller('pipelineExecutions', function($scope, $state,
                                             pipelineConfigService, scrollToService, executionService,
                                             viewStateCache, collapsibleSectionStateCache) {

    var executionsViewStateCache = viewStateCache.executions || viewStateCache.createCache('executions', {
        version: 1,
        maxAge: 180 * 24 * 60 * 60 * 1000, // 180 days
      });

    function cacheViewState() {
      executionsViewStateCache.put($scope.application.name, $scope.filter);
    }

    $scope.viewState = {
      loading: true
    };

    $scope.filterTemplate = require('./pipelineExecutions.executionFilter.html');

    $scope.filterCountOptions = [1, 2, 5, 10, 25, 50, 100];

    $scope.filter = executionsViewStateCache.get($scope.application.name) || {
      count: 5,
      execution: {
        status: {
          running: true,
          completed: true,
          failed: true,
          'not_started': true,
          canceled: true,
          suspended: true,
        },
        triggers: {
          jenkins: true,
        },
        groupBy: 'name',
        sortBy: 'startTime',
      },
    };

    $scope.statusDisplayNames = {
      failed: 'Failed',
      'not_started': 'Not Started',
      running: 'Running',
      completed: 'Completed',
      canceled: 'Canceled',
      suspended: 'Suspended',
    };

    function normalizeExecutionNames(executions) {
      var configurations = $scope.configurations || [];
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
    }

    function updateExecutions() {
      var executions = $scope.application.executions || [];
      normalizeExecutionNames(executions);
      $scope.executions = executions;
    }

    // The executionId will not be available in the $stateParams that would be passed into this controller
    // because that field belongs to a child state. So we have to watch for a $stateChangeSuccess event, then set
    // the value on the scope
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams) {
      $scope.detailsTarget = toParams.executionId;
    });

    function dataInitializationSuccess() {
      updateExecutions();
      $scope.viewState.loading = false;
      $scope.viewState.initializationError = false;
      // if we detected the loading of a details section, scroll it into view
      if ($scope.detailsTarget) {
        // make sure it's expanded
        var pipelines = $scope.executions.filter(function(execution) {
          return execution.id === $scope.detailsTarget;
        });
        if (pipelines.length) {
          collapsibleSectionStateCache.setExpanded(
            executionService.getSectionCacheKey($scope.filter.execution.groupBy, $scope.application.name, pipelines[0].name),
            true);
          scrollToService.scrollTo('execution-' + $scope.detailsTarget, '.execution-groups', 300);
        }
      }
      var noExecutions = !$scope.executions || !$scope.executions.length;
      var noConfigurations = !$scope.configurations.length;
      if(noExecutions && noConfigurations) {
        $state.go('^.pipelineConfig');
      }
    }

    function dataInitializationFailure() {
      $scope.viewState.loading = false;
      $scope.viewState.initializationError = true;
    }

    function setConfigurationsOnScope(configurations) {
      $scope.configurations = configurations;
    }

    pipelineConfigService.getPipelinesForApplication($scope.application.name)
      .then(setConfigurationsOnScope)
      .then(() =>{
        if ($scope.application.executionsLoaded) {
          dataInitializationSuccess();
        } else {
          $scope.$on('executions-loaded', dataInitializationSuccess);
        }
      })
      .catch(dataInitializationFailure);

    $scope.$on('executions-load-failure', dataInitializationFailure);
    $scope.$on('executions-reloaded', updateExecutions);
    $scope.$watch('filter', cacheViewState, true);

    this.toggleExpansion = (expand) => {
      $scope.$broadcast('toggle-expansion', expand);
    };

  });
