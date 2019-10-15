import { module } from 'angular';
import { Transition } from '@uirouter/core';

import { APPLICATION_STATE_PROVIDER, ApplicationStateProvider } from 'core/application/application.state.provider';
import { INestedState, StateConfigProvider } from 'core/navigation/state.provider';
import { filterModelConfig } from './filter/ExecutionFilterModel';

import { Executions } from 'core/pipeline/executions/Executions';
import { ExecutionNotFound } from 'core/pipeline/executions/ExecutionNotFound';
import { SingleExecutionDetails } from 'core/pipeline/details/SingleExecutionDetails';
import { ExecutionService } from './service/execution.service';

export const PIPELINE_STATES = 'spinnaker.core.pipeline.states';
module(PIPELINE_STATES, [APPLICATION_STATE_PROVIDER]).config([
  'applicationStateProvider',
  'stateConfigProvider',
  (applicationStateProvider: ApplicationStateProvider, stateConfigProvider: StateConfigProvider) => {
    const pipelineConfig: INestedState = {
      name: 'pipelineConfig',
      url: '/configure/:pipelineId?executionId&new',
      views: {
        pipelines: {
          templateUrl: require('../pipeline/config/pipelineConfig.html'),
          controller: 'PipelineConfigCtrl',
          controllerAs: 'vm',
        },
      },
      data: {
        pageTitleSection: {
          title: 'pipeline config',
        },
      },
    };

    // a specific stage can be deep linked by providing either refId or stageId,
    // which will be resolved to stage or step by the executionDetails controller to stage/step parameters,
    // replacing the URL
    const executionDetails: INestedState = {
      name: 'execution',
      url: '/:executionId?refId&stage&subStage&step&details&stageId',
      params: {
        stage: {
          value: '0',
        },
        step: {
          value: '0',
        },
      },
      data: {
        pageTitleDetails: {
          title: 'Execution Details',
          nameParam: 'executionId',
        },
      },
    };

    const singleExecutionDetails: INestedState = {
      name: 'executionDetails',
      url: '/details',
      views: {
        pipelines: { component: SingleExecutionDetails, $type: 'react' },
      },
      params: {
        executionParams: null,
      },
      abstract: true,
      children: [executionDetails],
    };

    const executions: INestedState = {
      name: 'executions',
      url: `?startManualExecution&${stateConfigProvider.paramsToQuery(filterModelConfig)}`,
      views: {
        pipelines: { component: Executions, $type: 'react' },
      },
      params: stateConfigProvider.buildDynamicParams(filterModelConfig),
      children: [executionDetails],
      data: {
        pageTitleSection: {
          title: 'Pipeline Executions',
        },
      },
    };

    const pipelines: INestedState = {
      name: 'pipelines',
      url: '/executions',
      redirectTo: (trans: Transition) => `${trans.to().name}.executions`,
      views: {
        insight: {
          template: '<div ui-view="pipelines" sticky-headers class="flex-fill"></div>',
        },
      },
      children: [executions, pipelineConfig, singleExecutionDetails],
    };

    applicationStateProvider.addChildState(pipelines);

    const executionsLookup: INestedState = {
      name: 'executionLookup',
      url: '/executions/:executionId',
      params: {
        executionId: { dynamic: true },
      },
      redirectTo: transition => {
        const { executionId } = transition.params();
        const executionService: ExecutionService = transition.injector().get('executionService');

        if (!executionId) {
          return undefined;
        }

        return Promise.resolve(executionService.getExecution(executionId))
          .then(execution =>
            transition.router.stateService.target(
              'home.applications.application.pipelines.executionDetails.execution',
              {
                application: execution.application,
                executionId: execution.id,
              },
            ),
          )
          .catch(() => {});
      },
      views: {
        'main@': { component: ExecutionNotFound, $type: 'react' },
      },
    };

    stateConfigProvider.addToRootState(executionsLookup);
  },
]);
