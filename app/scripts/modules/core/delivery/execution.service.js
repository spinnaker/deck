'use strict';
let angular = require('angular');

module.exports = angular.module('spinnaker.core.delivery.executions.service', [
  require('angular-ui-router'),
  require('../scheduler/scheduler.service.js'),
  require('../cache/deckCacheFactory.js'),
  require('../utils/appendTransform.js'),
  require('./executions.transformer.service.js'),
  require('../apiHost'),
])
  .factory('executionService', function($stateParams, $http, $timeout, $q, $log,
                                        scheduler, apiHostProvider, appendTransform, executionsTransformer) {

    function getExecutions(application, transformAll) {

      var deferred = $q.defer();
      $http({
        method: 'GET',
        transformResponse: appendTransform(function(executions) {
          if (!executions || !executions.length) {
            return [];
          }
          executions.forEach(function(execution) {
            let stringVal = JSON.stringify(execution);
            // do not transform if it hasn't changed unless requested
            let match = (application.executions || []).filter((test) => test.id === execution.id);
            if (transformAll || !match.length || !match[0].stringVal || match[0].stringVal !== stringVal) {
              execution.stringVal = stringVal;
              executionsTransformer.transformExecution(application, execution);
            }
          });
          return executions;
        }),
        url: [
          apiHostProvider.baseUrl(),
          'applications',
          application.name,
          'pipelines',
        ].join('/')
      }).then(
        function(resp) {
          deferred.resolve(resp.data);
        },
        function(resp) {
          deferred.reject(resp);
        }
      );
      return deferred.promise;
    }

    function waitUntilNewTriggeredPipelineAppears(application, pipelineName, triggeredPipelineId) {

      return application.reloadExecutions().then(function() {
        var executions = application.executions;
        var match = executions.filter(function(execution) {
          return execution.id === triggeredPipelineId;
        });
        var deferred = $q.defer();
        if (match && match.length) {
          deferred.resolve();
          return deferred.promise;
        } else {
          return $timeout(function() {
            return waitUntilNewTriggeredPipelineAppears(application, pipelineName, triggeredPipelineId);
          }, 1000);
        }
      });
    }

    function cancelExecution(executionId, applicationName) {
      var deferred = $q.defer();
      $http({
        method: 'PUT',
        url: [
          apiHostProvider.baseUrl(),
          'applications',
          (applicationName || $stateParams.application), // TODO: remove stateParams
          'pipelines',
          executionId,
          'cancel',
        ].join('/')
      }).then(
          function() {
            scheduler.scheduleImmediate();
            deferred.resolve();
          },
          function(exception) {
            deferred.reject(exception && exception.data ? exception.message : null);
          }
        );
      return deferred.promise;
    }

    function deleteExecution(application, executionId) {
      var deferred = $q.defer();
      $http({
        method: 'DELETE',
        url: [
          apiHostProvider.baseUrl(),
          'pipelines',
          executionId,
        ].join('/')
      }).then(
        function() {
          application.reloadExecutions().then(deferred.resolve);
        },
        function(exception) {
          deferred.reject(exception && exception.data ? exception.data.message : null);
        }
      );
      return deferred.promise;
    }

    function getSectionCacheKey(groupBy, application, heading) {
      return ['pipeline', groupBy, application, heading].join('#');
    }

    function getProjectExecutions(project, limit=1) {
      return $http({
        method: 'GET',
        transformResponse: appendTransform(function(executions) {
          if (!executions || !executions.length) {
            return [];
          }
          executions.forEach(function(execution) {
            executionsTransformer.transformExecution({}, execution);
          });
          return executions;
        }),
        url: [
          apiHostProvider.baseUrl(),
          'projects',
          project,
          'pipelines'
        ].join('/') + '?limit=' + limit
      }).then((resp) => {
        return resp.data.sort((a, b) => b.startTime - (a.startTime || new Date().getTime()));
      });
    }

    return {
      getAll: getExecutions,
      cancelExecution: cancelExecution,
      deleteExecution: deleteExecution,
      forceRefresh: scheduler.scheduleImmediate,
      waitUntilNewTriggeredPipelineAppears: waitUntilNewTriggeredPipelineAppears,
      getSectionCacheKey: getSectionCacheKey,
      getProjectExecutions: getProjectExecutions,
    };
  });
