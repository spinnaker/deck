import { IExpectedArtifact, IArtifactAccount, IArtifactSource, IArtifactKindConfig } from 'core';
import { ExpectedArtifactService } from './expectedArtifact.service';

export interface IExpectedArtifactSelectorViewControllerDelegate {
  getExpectedArtifacts(): IExpectedArtifact[];
  getSelectedExpectedArtifact(): IExpectedArtifact;
  getExpectedArtifactAccounts(): IArtifactAccount[];
  getSelectedAccount(): IArtifactAccount;
  getExpectedArtifactSources(): Array<IArtifactSource<any>>;
  getOfferedArtifactTypes?(): RegExp[];
  getExcludedArtifactTypes?(): RegExp[];
  getSupportedArtifactKinds(): IArtifactKindConfig[];
  setSelectedExpectedArtifact(e: IExpectedArtifact): void;
  setSelectedArtifactAccount(a: IArtifactAccount): void;
  createArtifact(): void;
  refreshExpectedArtifacts(): void;
}

export class ExpectedArtifactSelectorViewController {
  public accountsForArtifact: IArtifactAccount[] = [];

  constructor(private delegate: IExpectedArtifactSelectorViewControllerDelegate) {}

  public updateAccounts = (expectedArtifact: IExpectedArtifact) => {
    if (expectedArtifact == null) {
      this.accountsForArtifact = [];
    } else {
      const artifact = ExpectedArtifactService.artifactFromExpected(expectedArtifact);
      const allAccounts = this.delegate.getExpectedArtifactAccounts();
      this.accountsForArtifact = allAccounts.filter(a => a.types.includes(artifact.type));
      const selected = this.delegate.getSelectedAccount();
      if (!selected || !this.accountsForArtifact.find(a => a.name === selected.name)) {
        if (this.accountsForArtifact.length) {
          this.delegate.setSelectedArtifactAccount(this.accountsForArtifact[0]);
        } else {
          this.delegate.setSelectedArtifactAccount(null);
        }
      }
    }
  };

  public onArtifactChange = (expectedArtifact: IExpectedArtifact) => {
    this.delegate.setSelectedExpectedArtifact(expectedArtifact);
    this.updateAccounts(expectedArtifact);
  };

  public onArtifactCreated = (event: {
    expectedArtifact: IExpectedArtifact;
    account: IArtifactAccount;
    source: IArtifactSource<any>;
  }) => {
    ExpectedArtifactService.addArtifactTo(event.expectedArtifact, event.source.source);
    this.delegate.refreshExpectedArtifacts();
    this.updateAccounts(event.expectedArtifact);
    this.delegate.setSelectedExpectedArtifact(event.expectedArtifact);
    this.delegate.setSelectedArtifactAccount(event.account);
  };

  public onRequestCreate = () => {
    this.delegate.createArtifact();
  };

  public onAccountChange = (account: IArtifactAccount) => {
    this.delegate.setSelectedArtifactAccount(account);
  };
}
