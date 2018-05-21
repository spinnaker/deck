import { IComponentOptions, IController, module } from 'angular';
import { has, get, includes } from 'lodash';
import { ARTIFACT_ICON_LIST } from './artifactIconList';
import { IArtifact, IExpectedArtifact, IExecution, IStage } from 'core/domain';

import './artifactTab.less';

class ExecutionArtifactTabController implements IController {
  private _stage: IStage;
  private _execution: IExecution;

  public consumedArtifacts: IArtifact[] = [];
  public producedArtifacts: IArtifact[] = [];

  get stage(): IStage {
    return this._stage;
  }

  set stage(stage: IStage) {
    this._stage = stage;
    this.populateArtifactLists();
  }

  get execution(): IExecution {
    return this._execution;
  }

  set execution(execution: IExecution) {
    this._execution = execution;
    this.populateArtifactLists();
  }

  private extractBoundArtifactsFromExecution(execution: IExecution): IExpectedArtifact[] {
    const triggerArtifacts = get(execution, ['trigger', 'resolvedExpectedArtifacts'], []);
    const stageOutputArtifacts = get(execution, 'stages', []).reduce((out, stage) => {
      const outputArtifacts = get(stage, ['outputs', 'resolvedExpectedArtifacts'], []);
      return out.concat(outputArtifacts);
    }, []);
    const allArtifacts = triggerArtifacts.concat(stageOutputArtifacts);
    return allArtifacts.filter(a => has(a, 'boundArtifact'));
  }

  public populateArtifactLists() {
    const requiredArtifactIds = get(this.stage, ['context', 'requiredArtifactIds'], []);
    const manifestArtifactId = get(this.stage, ['context', 'manifestArtifactId'], null);
    const boundArtifacts = this.extractBoundArtifactsFromExecution(this.execution);

    const consumedIds = requiredArtifactIds.slice();
    if (manifestArtifactId) {
      consumedIds.push(manifestArtifactId);
    }

    this.consumedArtifacts = boundArtifacts
      .filter(rea => includes(consumedIds, rea.id))
      .map(rea => rea.boundArtifact)
      .filter(({ name, type }) => name && type);

    this.producedArtifacts = get(this.stage, ['outputs', 'artifacts'], []).slice();
  }
}

class ExecutionArtifactTabComponent implements IComponentOptions {
  public bindings: any = { stage: '<', execution: '<' };
  public controller: any = ExecutionArtifactTabController;
  public controllerAs = 'ctrl';
  public template = `
<div class="row execution-artifacts">
  <div class="col-md-6 artifact-list-container">
    <h5>Consumed Artifacts</h5>
    <div ng-if="ctrl.consumedArtifacts.length">
      <artifact-icon-list artifacts="ctrl.consumedArtifacts">
    </div>
  </div>
  <div class="col-md-6 artifact-list-container">
    <h5>Produced Artifacts</h5>
    <div ng-if="ctrl.producedArtifacts.length">
      <artifact-icon-list artifacts="ctrl.producedArtifacts">
    </div>
  </div>
</div>
`;
}

export const EXECUTION_ARTIFACT_TAB = 'spinnaker.core.artifact.artifactTab.component';

module(EXECUTION_ARTIFACT_TAB, [ARTIFACT_ICON_LIST]).component(
  'executionArtifactTab',
  new ExecutionArtifactTabComponent(),
);
