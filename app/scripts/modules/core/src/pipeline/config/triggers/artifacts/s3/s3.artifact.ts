/*
 * Copyright 2018 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { module } from 'angular';

import { PIPELINE_CONFIG_PROVIDER } from 'core/pipeline/config/pipelineConfigProvider';
import { IArtifact } from 'core/domain/IArtifact';
import { PipelineConfigProvider } from 'core/pipeline';

export const S3_ARTIFACT = 'spinnaker.core.pipeline.trigger.s3.artifact';
module(S3_ARTIFACT, [
  PIPELINE_CONFIG_PROVIDER,
]).config((pipelineConfigProvider: PipelineConfigProvider) => {
  pipelineConfigProvider.registerArtifactKind({
    label: 'S3',
    description: 'An S3 object.',
    key: 's3',
    isDefault: false,
    isMatch: true,
    controller(artifact: IArtifact) {
      'ngInject';
      this.artifact = artifact;
      this.artifact.type = 's3/object';
    },
    controllerAs: 'ctrl',
    template: `
<div class="col-md-12">
  <div class="form-group row">
    <label class="col-md-2 sm-label-right">
      Object path
      <help-field key="pipeline.config.expectedArtifact.s3.name"></help-field>
    </label>
    <div class="col-md-8">
      <input type="text"
             placeholder="s3://bucket/path/to/file"
             class="form-control input-sm"
             ng-model="ctrl.artifact.name"/>
    </div>
  </div>
</div>
`,
  });
});

