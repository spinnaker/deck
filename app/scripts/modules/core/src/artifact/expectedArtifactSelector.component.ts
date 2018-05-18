import { IComponentOptions, IController, module } from 'angular';

import { IExpectedArtifact } from 'core/domain';
import { IAccount } from 'core/account';
import { EXPECTED_ARTIFACT_SERVICE, ExpectedArtifactService } from './expectedArtifact.service';
import { ArtifactIconService } from './ArtifactIconService';

import './artifactSelector.less';

class ExpectedArtifactSelectorCtrl implements IController {
  public command: any;
  public id: any;
  public account: any;
  public accounts: IAccount[];
  public expectedArtifacts: IExpectedArtifact[];
  public helpFieldKey: string;
  public showIcons: boolean;

  constructor(public expectedArtifactService: ExpectedArtifactService) {
    'ngInject';
  }

  public iconPath(expected: IExpectedArtifact): string {
    const artifact = expected.matchArtifact || expected.defaultArtifact;
    if (artifact == null) {
      return '';
    }
    return ArtifactIconService.getPath(artifact.type);
  }
}

class ExpectedArtifactSelectorComponent implements IComponentOptions {
  public bindings: any = {
    command: '=',
    expectedArtifacts: '<',
    id: '=',
    account: '=',
    accounts: '<',
    helpFieldKey: '@',
    showIcons: '<',
  };
  public controller: any = ExpectedArtifactSelectorCtrl;
  public controllerAs = 'ctrl';
  public template = `
    <render-if-feature feature="artifacts">
      <ng-form name="artifact">
        <stage-config-field label="Expected Artifact" help-key="{{ctrl.helpFieldKey}}">
          <ui-select ng-model="ctrl.id"
                     class="form-control input-sm expected-artifact-selector" required>
            <ui-select-match>
              <img ng-if="ctrl.showIcons" width="16" height="16" class="artifact-icon" ng-src="{{ ctrl.iconPath($select.selected) }}" />
              {{ $select.selected | summarizeExpectedArtifact }}
            </ui-select-match>
            <ui-select-choices repeat="expected.id as expected in ctrl.expectedArtifacts">
              <img ng-if="ctrl.showIcons" width="16" height="16" class="artifact-icon" ng-src="{{ ctrl.iconPath(expected) }}" />
              <span>{{ expected | summarizeExpectedArtifact }}</span>
            </ui-select-choices>
          </ui-select>
        </stage-config-field>
        <stage-config-field ng-if="ctrl.account !== undefined"
                            label="Artifact Account">
          <ui-select ng-model="ctrl.account"
                     class="form-control input-sm">
            <ui-select-match>{{ $select.selected.name }}</ui-select-match>
            <ui-select-choices repeat="account.name as account in ctrl.accounts">
              <span>{{ account.name }}</span>
            </ui-select-choices>
          </ui-select>
        </stage-config-field>
      </ng-form>
    </render-if-feature>
  `;
}

export const EXPECTED_ARTIFACT_SELECTOR_COMPONENT = 'spinnaker.core.artifacts.expected.selector';
module(EXPECTED_ARTIFACT_SELECTOR_COMPONENT, [EXPECTED_ARTIFACT_SERVICE]).component(
  'expectedArtifactSelector',
  new ExpectedArtifactSelectorComponent(),
);
