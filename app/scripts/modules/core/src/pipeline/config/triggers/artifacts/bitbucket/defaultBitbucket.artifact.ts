import { module } from 'angular';

import { ArtifactTypePatterns } from 'core/artifact';
import { IArtifact } from 'core/domain/IArtifact';
import { Registry } from 'core/registry';

export const DEFAULT_BITBUCKET_ARTIFACT = 'spinnaker.core.pipeline.trigger.artifact.defaultBitbucket';
module(DEFAULT_BITBUCKET_ARTIFACT, []).config(() => {
  Registry.pipeline.mergeArtifactKind({
    label: 'Bitbucket',
    typePattern: ArtifactTypePatterns.BITBUCKET_FILE,
    type: 'bitbucket/file',
    description: 'A file stored in git, hosted by Bitbucket.',
    key: 'default.bitbucket',
    isDefault: true,
    isMatch: false,
    controller: function(artifact: IArtifact) {
      this.artifact = artifact;
      this.artifact.type = 'bitbucket/file';
      const pathRegex = new RegExp('.*/rest/api/1.0/[^/]*/[^/]*/repos/[^/]*/raw/(.*)$');

      this.onReferenceChange = () => {
        const results = pathRegex.exec(this.artifact.reference);
        if (results !== null) {
          this.artifact.name = results[1];
        } else {
          this.artifact.name = this.artifact.reference;
        }
      };
    },
    controllerAs: 'ctrl',
    template: `
<div class="col-md-12">
  <div class="form-group row">
    <label class="col-md-3 sm-label-right">
      Content URL
      <help-field key="pipeline.config.expectedArtifact.defaultBitbucket.reference"></help-field>
    </label>
    <div class="col-md-8">
      <input type="text"
             placeholder="https://api.bitbucket.com/rest/api/1.0/$PROJECTS/$PROJECTKEY/repos/$REPONAME/raw/$FILEPATH"
             class="form-control input-sm"
             ng-change="ctrl.onReferenceChange()"
             ng-model="ctrl.artifact.reference"/>
    </div>
  </div>
</div>
`,
  });
});
