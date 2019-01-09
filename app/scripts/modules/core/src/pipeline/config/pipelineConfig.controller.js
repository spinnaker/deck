'use strict';

import _ from 'lodash';
import { hri as HumanReadableIds } from 'human-readable-ids';

import { PipelineTemplateReader } from './templates/PipelineTemplateReader';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.core.pipeline.config.controller', [require('@uirouter/angularjs').default])
  .controller('PipelineConfigCtrl', function($scope, $stateParams, app) {
    this.application = app;
    this.state = {
      pipelinesLoaded: false,
    };

    this.containsJinja = source => source && (source.includes('{{') || source.includes('{%'));

    this.initialize = () => {
      this.pipelineConfig = _.find(app.pipelineConfigs.data, { id: $stateParams.pipelineId });

      if (this.pipelineConfig && this.pipelineConfig.expectedArtifacts) {
        for (const artifact of this.pipelineConfig.expectedArtifacts) {
          if (!artifact.displayName || artifact.displayName.length === 0) {
            artifact.displayName = HumanReadableIds.random();
          }
        }
      }

      if (this.pipelineConfig && this.pipelineConfig.type === 'templatedPipeline') {
        this.isTemplatedPipeline = true;
        this.hasDynamicSource = this.containsJinja(this.pipelineConfig.config.pipeline.template.source);
        if (!this.pipelineConfig.isNew) {
          return PipelineTemplateReader.getPipelinePlan(this.pipelineConfig, $stateParams.executionId)
            .then(plan => (this.pipelinePlan = plan))
            .catch(error => {
              this.templateError = error;
              this.pipelineConfig.isNew = true;
            });
        }
      } else if (!this.pipelineConfig) {
        this.pipelineConfig = _.find(app.strategyConfigs.data, { id: $stateParams.pipelineId });
        if (!this.pipelineConfig) {
          this.state.notFound = true;
        }
      }
      if (this.pipelineConfig) {
        this.pipelineConfig = _.cloneDeep(this.pipelineConfig);
      }
    };

    if (!app.notFound) {
      app.pipelineConfigs.activate();
      app.pipelineConfigs
        .ready()
        .then(this.initialize)
        .then(() => (this.state.pipelinesLoaded = true));
    }
  });
