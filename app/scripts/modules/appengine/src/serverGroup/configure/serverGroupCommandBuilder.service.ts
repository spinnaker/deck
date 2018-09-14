import { IPromise, IQService, module } from 'angular';

import {
  AccountService,
  StorageAccountReader,
  Application,
  IBuildTrigger,
  IExpectedArtifact,
  IGitTrigger,
  IPipeline,
  IStage,
} from '@spinnaker/core';

import {
  GitCredentialType,
  IAppengineAccount,
  IAppengineGitTrigger,
  IAppengineJenkinsTrigger,
  IAppengineServerGroup,
} from 'appengine/domain';

import { AppengineProviderSettings } from 'appengine/appengine.settings';
import { AppengineDeployDescription } from '../transformer';

export interface IAppengineServerGroupCommand {
  application?: string;
  stack?: string;
  freeFormDetails?: string;
  configFilepaths?: string[];
  configFiles?: string[];
  applicationDirectoryRoot: string;
  branch?: string;
  repositoryUrl?: string;
  credentials: string;
  region: string;
  selectedProvider: string;
  promote?: boolean;
  stopPreviousVersion?: boolean;
  type?: string;
  backingData: any;
  viewState: IViewState;
  strategy?: string;
  strategyApplication?: string;
  strategyPipeline?: string;
  fromTrigger?: boolean;
  trigger?: IAppengineGitTrigger | IAppengineJenkinsTrigger;
  gitCredentialType?: GitCredentialType;
  storageAccountName?: string; // GCS only
  interestingHealthProviderNames: string[];
  fromArtifact: boolean;
  expectedArtifactId: string;
  sourceType: string;
  containerImageUrl?: string;
}

export enum AppengineSourceType {
  GCS = 'gcs',
  GIT = 'git',
  ARTIFACT = 'artifact',
  CONTAINER_IMAGE = 'containerImage',
}

export interface IViewState {
  mode: string;
  submitButtonLabel: string;
  disableStrategySelection: boolean;
  stage?: IStage;
  pipeline?: IPipeline;
}

export class AppengineServerGroupCommandBuilder {
  private static getTriggerOptions(pipeline: IPipeline): Array<IAppengineGitTrigger | IAppengineJenkinsTrigger> {
    return (pipeline.triggers || [])
      .filter(trigger => trigger.type === 'git' || trigger.type === 'jenkins' || trigger.type === 'travis')
      .map((trigger: IGitTrigger | IBuildTrigger) => {
        if (trigger.type === 'git') {
          return {
            source: trigger.source,
            project: trigger.project,
            slug: trigger.slug,
            branch: trigger.branch,
            type: 'git',
          };
        } else {
          return { master: trigger.master, job: trigger.job, type: trigger.type };
        }
      });
  }

  private static getExpectedArtifacts(pipeline: IPipeline): IExpectedArtifact[] {
    return pipeline.expectedArtifacts || [];
  }

  constructor(private $q: IQService) {
    'ngInject';
  }

  public buildNewServerGroupCommand(
    app: Application,
    selectedProvider = 'appengine',
    mode = 'create',
  ): IPromise<IAppengineServerGroupCommand> {
    const dataToFetch = {
      accounts: AccountService.getAllAccountDetailsForProvider('appengine'),
      storageAccounts: StorageAccountReader.getStorageAccounts(),
    };

    const viewState: IViewState = {
      mode,
      submitButtonLabel: this.getSubmitButtonLabel(mode),
      disableStrategySelection: mode === 'create',
    };

    return this.$q.all(dataToFetch).then((backingData: any) => {
      const credentials = this.getCredentials(backingData.accounts);
      const region = this.getRegion(backingData.accounts, credentials);

      return {
        application: app.name,
        backingData,
        viewState,
        fromArtifact: false,
        credentials,
        region,
        selectedProvider,
        interestingHealthProviderNames: [],
        sourceType: AppengineSourceType.GIT,
      } as IAppengineServerGroupCommand;
    });
  }

  public buildServerGroupCommandFromExisting(
    app: Application,
    serverGroup: IAppengineServerGroup,
  ): IPromise<IAppengineServerGroupCommand> {
    return this.buildNewServerGroupCommand(app, 'appengine', 'clone').then(command => {
      command.stack = serverGroup.stack;
      command.freeFormDetails = serverGroup.detail;
      return command;
    });
  }

  public buildNewServerGroupCommandForPipeline(
    _stage: IStage,
    pipeline: IPipeline,
  ): IPromise<{
    viewState: {
      stage: IStage;
      pipeline: IPipeline;
    };
    backingData: {
      triggerOptions: Array<IAppengineGitTrigger | IAppengineJenkinsTrigger>;
      expectedArtifacts: IExpectedArtifact[];
    };
  }> {
    // We can't copy server group configuration for App Engine, and can't build the full command here because we don't have
    // access to the application.
    return this.$q.when({
      viewState: {
        pipeline,
        stage: _stage,
      },
      backingData: {
        triggerOptions: AppengineServerGroupCommandBuilder.getTriggerOptions(pipeline),
        expectedArtifacts: AppengineServerGroupCommandBuilder.getExpectedArtifacts(pipeline),
      },
    });
  }

  public buildServerGroupCommandFromPipeline(
    app: Application,
    cluster: AppengineDeployDescription,
    _stage: IStage,
    pipeline: IPipeline,
  ): ng.IPromise<IAppengineServerGroupCommand> {
    return this.buildNewServerGroupCommand(app, 'appengine', 'editPipeline').then(
      (command: IAppengineServerGroupCommand) => {
        command = {
          ...command,
          ...cluster,
          backingData: {
            ...command.backingData,
            triggerOptions: AppengineServerGroupCommandBuilder.getTriggerOptions(pipeline),
            expectedArtifacts: AppengineServerGroupCommandBuilder.getExpectedArtifacts(pipeline),
          },
          viewState: {
            ...command.viewState,
            stage: _stage,
            pipeline,
          },
        } as IAppengineServerGroupCommand;
        return command;
      },
    );
  }

  private getCredentials(accounts: IAppengineAccount[]): string {
    const accountNames: string[] = (accounts || []).map(account => account.name);
    const defaultCredentials: string = AppengineProviderSettings.defaults.account;

    return accountNames.includes(defaultCredentials) ? defaultCredentials : accountNames[0];
  }

  private getRegion(accounts: IAppengineAccount[], credentials: string): string {
    const account = accounts.find(_account => _account.name === credentials);
    return account ? account.region : null;
  }

  private getSubmitButtonLabel(mode: string): string {
    switch (mode) {
      case 'createPipeline':
        return 'Add';
      case 'editPipeline':
        return 'Done';
      case 'clone':
        return 'Clone';
      default:
        return 'Create';
    }
  }
}

export const APPENGINE_SERVER_GROUP_COMMAND_BUILDER = 'spinnaker.appengine.serverGroupCommandBuilder.service';

module(APPENGINE_SERVER_GROUP_COMMAND_BUILDER, []).service(
  'appengineServerGroupCommandBuilder',
  AppengineServerGroupCommandBuilder,
);
