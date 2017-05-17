import { IPromise, IQService, module } from 'angular';
import { intersection } from 'lodash';

import {
  ACCOUNT_SERVICE,
  AccountService,
  Application,
  IBuildTrigger,
  IGitTrigger,
  IPipeline,
  IStage
} from '@spinnaker/core';

import {
  GitCredentialType,
  IAppengineAccount,
  IAppengineGitTrigger,
  IAppengineJenkinsTrigger,
  IAppengineServerGroup
} from 'appengine/domain/index';

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
  interestingHealthProviderNames: string[];
}

interface IViewState {
  mode: string;
  submitButtonLabel: string;
  disableStrategySelection: boolean;
}

export class AppengineServerGroupCommandBuilder {
  private static getTriggerOptions(pipeline: IPipeline): Array<IAppengineGitTrigger | IAppengineJenkinsTrigger> {
    return (pipeline.triggers || [])
      .filter(trigger => trigger.type === 'git' || trigger.type === 'jenkins' || trigger.type === 'travis')
      .map((trigger: IGitTrigger | IBuildTrigger) => {
        if (trigger.type === 'git') {
          return {source: trigger.source, project: trigger.project, slug: trigger.slug, branch: trigger.branch, type: 'git'};
        } else {
          return {master: trigger.master, job: trigger.job, type: trigger.type};
        }
      });
  }

  constructor(private $q: IQService, private accountService: AccountService) { 'ngInject'; }

  public buildNewServerGroupCommand(app: Application,
                                    selectedProvider = 'appengine',
                                    mode = 'create'): IPromise<IAppengineServerGroupCommand> {
    const dataToFetch = {
      accounts: this.accountService.getAllAccountDetailsForProvider('appengine'),
    };

    const viewState: IViewState = {
      mode: mode,
      submitButtonLabel: this.getSubmitButtonLabel(mode),
      disableStrategySelection: mode === 'create' ? true : false,
    };

    return this.$q.all(dataToFetch)
      .then((backingData: any) => {
        const credentials: string = this.getCredentials(backingData.accounts, app);
        const region: string = this.getRegion(backingData.accounts, credentials);

        return {
          application: app.name,
          backingData,
          viewState,
          credentials,
          region,
          selectedProvider,
          interestingHealthProviderNames: [],
        } as IAppengineServerGroupCommand;
      });
  }

  public buildServerGroupCommandFromExisting(app: Application, serverGroup: IAppengineServerGroup): IPromise<IAppengineServerGroupCommand> {
    return this.buildNewServerGroupCommand(app, 'appengine', 'clone')
      .then(command => {
        command.stack = serverGroup.stack;
        command.freeFormDetails = serverGroup.detail;
        return command;
      });
  }

  public buildNewServerGroupCommandForPipeline(_stage: IStage, pipeline: IPipeline): {backingData: {triggerOptions: Array<IAppengineGitTrigger | IAppengineJenkinsTrigger>}} {
    // We can't copy server group configuration for App Engine, and can't build the full command here because we don't have
    // access to the application.
    return {backingData: {triggerOptions: AppengineServerGroupCommandBuilder.getTriggerOptions(pipeline)}};
  }

  public buildServerGroupCommandFromPipeline(app: Application,
                                             cluster: AppengineDeployDescription,
                                             _stage: IStage,
                                             pipeline: IPipeline): ng.IPromise<IAppengineServerGroupCommand> {
    return this.buildNewServerGroupCommand(app, 'appengine', 'editPipeline')
      .then((command: IAppengineServerGroupCommand) => {
        Object.assign(command, cluster);
        command.backingData.triggerOptions = AppengineServerGroupCommandBuilder.getTriggerOptions(pipeline);
        return command;
      });
  }

  private getCredentials(accounts: IAppengineAccount[], application: Application): string {
    const accountNames: string[] = (accounts || []).map((account) => account.name);
    const defaultCredentials: string = AppengineProviderSettings.defaults.account;
    const firstApplicationAccount: string = intersection(application.accounts || [], accountNames)[0];

    return accountNames.includes(defaultCredentials) ?
      defaultCredentials :
      (firstApplicationAccount || 'my-appengine-account');
  }

  private getRegion(accounts: IAppengineAccount[], credentials: string): string {
    const account = accounts.find((_account) => _account.name === credentials);
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

module(APPENGINE_SERVER_GROUP_COMMAND_BUILDER, [
  ACCOUNT_SERVICE,
]).service('appengineServerGroupCommandBuilder', AppengineServerGroupCommandBuilder);
