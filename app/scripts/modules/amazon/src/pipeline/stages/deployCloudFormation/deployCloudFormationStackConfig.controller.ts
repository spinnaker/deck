import { IController, IScope } from 'angular';
import { extend } from 'lodash';
import { $q } from 'ngimport';
import {
  ExpectedArtifactSelectorViewController,
  NgGenericArtifactDelegate,
  AccountService,
  IAccountDetails,
  IArtifact,
  IExpectedArtifact,
} from '@spinnaker/core';

export class DeployCloudFormationStackConfigController implements IController {
  public state = {
    loaded: false,
  };

  public textSource = 'text';
  public artifactSource = 'artifact';
  public sources = [this.textSource, this.artifactSource];
  public showClusterSelect = false;
  public accounts: IAccountDetails[];

  public cloudFormationStackArtifactDelegate: NgGenericArtifactDelegate;
  public cloudFormationStackArtifactController: ExpectedArtifactSelectorViewController;

  constructor(private $scope: IScope) {
    const dataToFetch = {
      accounts: AccountService.getAllAccountDetailsForProvider('aws'),
      artifactAccounts: AccountService.getArtifactAccounts(),
    };
    $q.all(dataToFetch).then(backingData => {
      const { accounts, artifactAccounts } = backingData;
      this.accounts = accounts;
      this.state.loaded = true;
      this.cloudFormationStackArtifactDelegate.setAccounts(artifactAccounts);
      this.cloudFormationStackArtifactController.updateAccounts(
        this.cloudFormationStackArtifactDelegate.getSelectedExpectedArtifact(),
      );
    });
    this.cloudFormationStackArtifactDelegate = new NgGenericArtifactDelegate($scope, 'stack');
    this.cloudFormationStackArtifactController = new ExpectedArtifactSelectorViewController(
      this.cloudFormationStackArtifactDelegate,
    );
  }

  public canShowAccountSelect() {
    return (
      this.$scope.stage.source === this.artifactSource &&
      !this.$scope.showCreateArtifactForm &&
      this.cloudFormationStackArtifactController.accountsForArtifact.length > 1
    );
  }

  public isChangeSet() {
    return this.$scope.stage.isChangeSet;
  }

  public capabilities() {
    return this.$scope.stage.capabilities;
  }

  public toggleChangeSet() {
    this.$scope.stage.isChangeSet = !this.$scope.stage.isChangeSet;
  }

  public toggleCapabilities() {
    if (this.$scope.stage.capabilities) {
      delete this.$scope.stage.capabilities;
    } else {
      this.$scope.stage.capabilities = ['CAPABILITY_NAMED_IAM'];
    }
  }

  public onStackArtifactEdited = (artifact: IArtifact) => {
    this.$scope.$applyAsync(() => {
      this.$scope.stage.stackArtifactId = null;
      this.$scope.stage.stackArtifact = artifact;
    });
  };

  public onStackArtifactSelected = (expectedArtifact: IExpectedArtifact) => {
    this.onChangeStackArtifactId(expectedArtifact.id);
  };

  public onChangeStackArtifactId = (artifactId: string) => {
    this.$scope.$applyAsync(() => {
      this.$scope.stage.stackArtifactId = artifactId;
      this.$scope.stage.stackArtifact = null;
    });
  };

  public onStackArtifactAccountSelected = (stackArtifactAccount: string) => {
    this.$scope.$applyAsync(() => {
      this.$scope.stage.stackArtifactAccount = stackArtifactAccount;
    });
  };

  public updatePipeline = (changes: any) => {
    this.$scope.$applyAsync(() => {
      extend(this.$scope.pipeline, changes);
    });
  };
}
