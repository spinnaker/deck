import { IAttributes, IComponentController, IComponentOptions, module } from 'angular';

import { ExpectedArtifactService } from 'core/artifact';
import { IExpectedArtifact } from 'core/domain';

class ExpectedArtifactController implements IComponentController {
  public expectedArtifact: IExpectedArtifact;
  public usePriorExecution: boolean;
  public removeExpectedArtifact: any;
  public context: any;

  public static $inject = ['$attrs'];
  public constructor(private $attrs: IAttributes) {
    'nginject';

    this.usePriorExecution = this.$attrs.$attr.hasOwnProperty('usePriorExecution');
  }

  public onUseDefaultArtifactChanged() {
    const {
      expectedArtifact: { useDefaultArtifact, defaultArtifact, matchArtifact },
    } = this;
    if (useDefaultArtifact && defaultArtifact.type == null) {
      const defaultKindConfig = ExpectedArtifactService.getKindConfig(matchArtifact, true);
      defaultArtifact.type = defaultKindConfig.type || matchArtifact.type;
      // kind is deprecated; remove it from artifacts as they are updated
      delete defaultArtifact.kind;
      defaultArtifact.customKind = defaultKindConfig.customKind;
    }
  }
}

const expectedArtifactComponent: IComponentOptions = {
  bindings: { expectedArtifact: '=', removeExpectedArtifact: '=', context: '=' },
  controller: ExpectedArtifactController,
  controllerAs: 'ctrl',
  template: `
<div class="row">
  <div class="col-md-12">
    <div class="form-horizontal panel-pipeline-phase">
      <div class="form-group row">
        <div class="col-md-3">
          Match against
          <help-field key="pipeline.config.expectedArtifact.matchArtifact"/>
        </div>
        <div class="col-md-2 col-md-offset-7" ng-if="ctrl.removeExpectedArtifact">
          <button class="btn btn-sm btn-default" ng-click="ctrl.removeExpectedArtifact(ctrl.context, ctrl.expectedArtifact)">
            <span class="glyphicon glyphicon-trash" uib-tooltip="Remove expected artifact"/>
            <span class="visible-xl-inline">Remove artifact</span>
          </button>
        </div>
      </div>
      <artifact is-match artifact="ctrl.expectedArtifact.matchArtifact"/>
      <hr/>
      Assign to a matched artifact
      <div class="form-group row"/> <!-- spacing -->
      <div class="form-group row">
        <label class="col-md-2 sm-label-right">
          Display name
        </label>
        <div class="col-md-4">
          <input class="form-control input-sm" ng-model="ctrl.expectedArtifact.displayName"/>
        </div>
      </div>
      <hr/>
      If missing
      <help-field key="pipeline.config.expectedArtifact.ifMissing"/>
      <div class="form-group row" ng-if="ctrl.usePriorExecution">
        <label class="col-md-4 sm-label-right">
          Use Prior Execution
        </label>
        <input class="col-md-1" type="checkbox" ng-model="ctrl.expectedArtifact.usePriorArtifact">
      </div>
      <div class="form-group row">
        <label class="col-md-4 sm-label-right">
          Use Default Artifact
        </label>
        <input class="col-md-1" type="checkbox" ng-model="ctrl.expectedArtifact.useDefaultArtifact" ng-change="ctrl.onUseDefaultArtifactChanged()">
      </div>
      <div class="form-group row" ng-show="ctrl.expectedArtifact.useDefaultArtifact" style="height: 30px">
        <div class="col-md-3">
          Default artifact
          <help-field key="pipeline.config.expectedArtifact.defaultArtifact"/>
        </div>
      </div>
      <artifact ng-show="ctrl.expectedArtifact.useDefaultArtifact" is-default artifact="ctrl.expectedArtifact.defaultArtifact"></artifact>
    </div>
  </div>
</div>
`,
};

export const EXPECTED_ARTIFACT = 'spinnaker.core.pipeline.trigger.artifacts.expected';
module(EXPECTED_ARTIFACT, []).component('expectedArtifact', expectedArtifactComponent);
