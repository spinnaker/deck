import {DataSourceConfig} from '../application/service/applicationDataSource';
import {APPLICATION_DATA_SOURCE_REGISTRY} from '../application/service/applicationDataSource.registry';
import {EXECUTION_SERVICE} from './service/execution.service';
import {PIPELINE_CONFIG_SERVICE} from 'core/pipeline/config/services/pipelineConfig.service';
import {SETTINGS} from 'core/config/settings';
import {CLUSTER_SERVICE} from 'core/cluster/cluster.service';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.core.delivery.dataSource', [
    APPLICATION_DATA_SOURCE_REGISTRY,
    EXECUTION_SERVICE,
    PIPELINE_CONFIG_SERVICE,
    CLUSTER_SERVICE,
  ])
  .run(function($q, applicationDataSourceRegistry, executionService, pipelineConfigService, clusterService) {

    let addExecutions = (application, executions) => {
      executionService.transformExecutions(application, executions, application.executions.data);
      return $q.when(executionService.addExecutionsToApplication(application, executions));
    };

    let loadExecutions = (application) => {
      return executionService.getExecutions(application.name);
    };

    let loadPipelineConfigs = (application) => {
      let pipelineLoader = pipelineConfigService.getPipelinesForApplication(application.name),
          strategyLoader = pipelineConfigService.getStrategiesForApplication(application.name);
      return $q.all({pipelineConfigs: pipelineLoader, strategyConfigs: strategyLoader});
    };

    let addPipelineConfigs = (application, data) => {
      application.strategyConfigs = { data: data.strategyConfigs };
      return $q.when(data.pipelineConfigs);
    };

    let loadRunningExecutions = (application) => {
      return executionService.getRunningExecutions(application.name);
    };

    let addRunningExecutions = (application, data) => {
      executionService.transformExecutions(application, data);
      return $q.when(data);
    };

    let runningExecutionsLoaded = (application) => {
      clusterService.addExecutionsToServerGroups(application);
      executionService.mergeRunningExecutionsIntoExecutions(application);
      application.getDataSource('serverGroups').dataUpdated();
    };

    let executionsLoaded = (application) => {
      executionService.removeCompletedExecutionsFromRunningData(application);
    };

    if (SETTINGS.feature.pipelines !== false) {
      applicationDataSourceRegistry.registerDataSource(new DataSourceConfig({
        optional: true,
        primary: true,
        icon: 'tasks',
        key: 'executions',
        label: 'Pipelines',
        sref: '.pipelines.executions',
        activeState: '**.pipelines.**',
        loader: loadExecutions,
        onLoad: addExecutions,
        afterLoad: executionsLoaded,
        lazy: true,
        badge: 'runningExecutions',
        description: 'Orchestrated deployment management'
      }));

      applicationDataSourceRegistry.registerDataSource(new DataSourceConfig({
        key: 'pipelineConfigs',
        loader: loadPipelineConfigs,
        onLoad: addPipelineConfigs,
        lazy: true,
        visible: false,
      }));

      applicationDataSourceRegistry.registerDataSource(new DataSourceConfig({
        key: 'runningExecutions',
        visible: false,
        loader: loadRunningExecutions,
        onLoad: addRunningExecutions,
        afterLoad: runningExecutionsLoaded,
      }));
    }

  });
