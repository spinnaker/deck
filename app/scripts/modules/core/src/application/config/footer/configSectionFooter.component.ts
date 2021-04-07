import { IController, IComponentOptions, copy, module, toJson } from 'angular';
import { cloneDeep } from 'lodash';

import { ApplicationWriter } from '../../service/ApplicationWriter';
import { Application } from '../../application.model';

export interface IConfigSectionFooterViewState {
  originalConfig: any;
  originalStringVal: string;
  saving: boolean;
  saveError: boolean;
  isDirty: boolean;
  saveErrorMessage: string;
}

export class ConfigSectionFooterController implements IController {
  public viewState: IConfigSectionFooterViewState;
  public application: Application;
  public config: any;
  public configField: string;
  public saveDisabled: boolean;
  public displayErrorMessage = false;

  public revert(): void {
    copy(this.viewState.originalConfig, this.config);
    this.viewState.isDirty = false;
  }

  private saveSuccess(): void {
    this.viewState.originalConfig = cloneDeep(this.config);
    this.viewState.originalStringVal = toJson(this.config);
    this.viewState.isDirty = false;
    this.viewState.saving = false;
    this.application.attributes[this.configField] = this.config;
  }

  private saveError(): void {
    this.viewState.saving = false;
    this.viewState.saveError = true;
  }

  public save(): void {
    this.viewState.saving = true;
    this.viewState.saveError = false;

    const updateCommand: any = {
      name: this.application.name,
      accounts: this.application.attributes.accounts,
    };
    updateCommand[this.configField] = this.config;

    ApplicationWriter.updateApplication(updateCommand).then(
      () => {
        this.saveSuccess();
      },
      (error) => {
        this.saveError();
        if (error != null) {
          try {
            const responseBody = JSON.parse(error.variables[0].value.details.responseBody);
            this.viewState.saveErrorMessage = responseBody.errors;
          } catch {
            this.viewState.saveErrorMessage = error.toString();
          }
          if (this.viewState.saveErrorMessage == undefined) {
            this.viewState.saveErrorMessage = error.variables[0].value.details.responseBody;
          }
        }
      },
    );
  }

  public toggleErrorMessage() {
    this.displayErrorMessage = !this.displayErrorMessage;
  }
}

const configSectionFooterComponent: IComponentOptions = {
  bindings: {
    application: '=',
    config: '=',
    viewState: '=',
    configField: '@',
    revert: '&?',
    afterSave: '&?',
    saveDisabled: '<',
  },
  controller: ConfigSectionFooterController,
  templateUrl: require('./configSectionFooter.component.html'),
};

export const CONFIG_SECTION_FOOTER = 'spinnaker.core.application.config.section.footer.component';

module(CONFIG_SECTION_FOOTER, []).component('configSectionFooter', configSectionFooterComponent);
