import { module } from 'angular';
import { SETTINGS } from 'core/config';
import { INestedState, STATE_CONFIG_PROVIDER, StateConfigProvider } from 'core/navigation';
import { PipelineTemplatesV2 } from './PipelineTemplatesV2';

export const PIPELINE_TEMPLATES_V2_STATES_CONFIG = 'spinnaker.core.pipeline.templates.v2.states.config';

module(PIPELINE_TEMPLATES_V2_STATES_CONFIG, [STATE_CONFIG_PROVIDER]).config([
  'stateConfigProvider',
  (stateConfigProvider: StateConfigProvider) => {
    const pipelineTemplateDetail: INestedState = {
      name: 'pipeline-templates-detail',
      url: '/:templateId',
      data: {
        pageTitleMain: {
          label: 'Pipeline Templates',
        },
      },
    };

    const pipelineTemplatesList: INestedState = {
      name: 'pipeline-templates',
      url: '/pipeline-templates',
      views: {
        'main@': {
          component: PipelineTemplatesV2,
          $type: 'react',
        },
      },
      data: {
        pageTitleMain: {
          label: 'Pipeline Templates',
        },
      },
      children: [pipelineTemplateDetail],
    };

    if (SETTINGS.feature.managedPipelineTemplatesV2UI) {
      stateConfigProvider.addToRootState(pipelineTemplatesList);
    }
  },
]);
