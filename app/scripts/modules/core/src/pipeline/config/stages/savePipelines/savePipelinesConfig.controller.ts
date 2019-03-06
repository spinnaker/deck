import { IController, IScope } from 'angular';
import { defaults } from 'lodash';

export class SavePipelinesConfigCtrl implements IController {
  public state = {
    loaded: false,
  };

  public artifactSource = 'artifact';

  public static $inject = ['$scope'];
  constructor(private $scope: IScope) {
    if (this.$scope.stage.isNew) {
      defaults(this.$scope.stage, {
        source: this.artifactSource,
      });
    }
    this.state.loaded = true;
    $scope.artifact = {
      id: '',
      source: 'expectedArtifact',
    };
  }

  public onExpectedArtifactSelected = (artifact: any) => {
    this.$scope.$applyAsync(() => {
      this.$scope.stage.pipelinesArtifactId = artifact.id;
      delete this.$scope.stage.pipelinesArtifact;
    });
  };

  public onArtifactEdited = (artifact: any) => {
    this.$scope.$applyAsync(() => {
      this.$scope.stage.pipelinesArtifact = artifact;
      delete this.$scope.stage.pipelinesArtifactId;
    });
  };
}
