import { module } from 'angular';

import { IArtifact } from 'core/domain/IArtifact';
import { Registry } from 'core/registry';

export const DOCKER_ARTIFACT = 'spinnaker.core.pipeline.trigger.artifact.docker';
module(DOCKER_ARTIFACT, []).config(() => {
  Registry.pipeline.registerArtifactKind({
    label: 'Docker',
    type: 'docker/image',
    isDefault: false,
    isMatch: true,
    description: 'A Docker image to be deployed.',
    key: 'docker',
    controller: function(artifact: IArtifact) {
      'ngInject';
      this.artifact = artifact;
      this.artifact.type = 'docker/image';
    },
    controllerAs: 'ctrl',
    template: `
<div class="col-md-12">
  <div class="form-group row">
    <label class="col-md-2 sm-label-right">
      Docker image
      <help-field key="pipeline.config.expectedArtifact.docker.name"></help-field>
    </label>
    <div class="col-md-8">
      <input type="text"
             placeholder="gcr.io/project/image"
             class="form-control input-sm"
             ng-model="ctrl.artifact.name"/>
    </div>
  </div>
</div>
`,
  });
});
