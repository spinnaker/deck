import React from 'react';

import { Observable, Subject } from 'rxjs';

import { get } from 'lodash';

import { FormikErrors, FormikProps } from 'formik';

import {
  AccountService,
  CheckboxInput,
  FormikFormField,
  IAccount,
  IRegion,
  IWizardPageComponent,
  HelpField,
  ReactSelectInput,
  TextInput,
} from '@spinnaker/core';

import { ICloudFoundryCreateServerGroupCommand } from 'cloudfoundry/serverGroup/configure/serverGroupConfigurationModel.cf';
import { CloudFoundryDeploymentStrategySelector } from 'cloudfoundry/deploymentStrategy/CloudFoundryDeploymentStrategySelector';

import 'cloudfoundry/common/cloudFoundry.less';

export interface ICloudFoundryServerGroupBasicSettingsProps {
  formik: FormikProps<ICloudFoundryCreateServerGroupCommand>;
}

export interface ICloudFoundryServerGroupLocationSettingsState {
  accounts: IAccount[];
  regions: IRegion[];
}

export class CloudFoundryServerGroupBasicSettings
  extends React.Component<ICloudFoundryServerGroupBasicSettingsProps, ICloudFoundryServerGroupLocationSettingsState>
  implements IWizardPageComponent<ICloudFoundryCreateServerGroupCommand> {
  private destroy$ = new Subject();
  public state: ICloudFoundryServerGroupLocationSettingsState = {
    accounts: [],
    regions: [],
  };

  public componentDidMount(): void {
    Observable.fromPromise(AccountService.listAccounts('cloudfoundry'))
      .takeUntil(this.destroy$)
      .subscribe(accounts => {
        this.setState({ accounts });
        this.updateRegionList();
      });
  }

  public componentWillUnmount(): void {
    this.destroy$.next();
  }

  private accountChanged = (): void => {
    this.updateRegionList();
    this.props.formik.setFieldValue('region', '');
  };

  private updateRegionList = (): void => {
    const credentials = get(this.props.formik.values, 'credentials', undefined);
    if (credentials) {
      Observable.fromPromise(AccountService.getRegionsForAccount(credentials))
        .takeUntil(this.destroy$)
        .subscribe(regions => this.setState({ regions }));
    }
  };

  private strategyChanged = (_values: ICloudFoundryCreateServerGroupCommand, strategy: any) => {
    this.props.formik.setFieldValue('strategy', strategy.key);
  };

  private onStrategyFieldChange = (key: string, value: any) => {
    this.props.formik.setFieldValue(key, value);
  };

  public render(): JSX.Element {
    const { formik } = this.props;
    const { accounts, regions } = this.state;
    const { values } = formik;
    return (
      <div className="form-group">
        <div className="col-md-11">
          <div className="sp-margin-m-bottom">
            <FormikFormField
              name="credentials"
              label="Account"
              fastField={false}
              input={props => (
                <ReactSelectInput
                  inputClassName="cloudfoundry-react-select"
                  {...props}
                  stringOptions={accounts && accounts.map((acc: IAccount) => acc.name)}
                  clearable={false}
                />
              )}
              onChange={this.accountChanged}
              required={true}
            />
          </div>
          <div className="sp-margin-m-bottom">
            <FormikFormField
              name="region"
              label="Region"
              fastField={false}
              input={props => (
                <ReactSelectInput
                  {...props}
                  stringOptions={regions && regions.map((region: IRegion) => region.name)}
                  inputClassName={'cloudfoundry-react-select'}
                  clearable={false}
                />
              )}
              required={true}
            />
          </div>
          <div className="sp-margin-m-bottom">
            <FormikFormField
              name="stack"
              label="Stack"
              input={props => <TextInput {...props} />}
              help={<HelpField id="cf.serverGroup.stack" />}
            />
          </div>
          <div className="sp-margin-m-bottom">
            <FormikFormField
              name="freeFormDetails"
              label="Detail"
              input={props => <TextInput {...props} />}
              help={<HelpField id="cf.serverGroup.detail" />}
            />
          </div>
          <div className="sp-margin-m-bottom cloud-foundry-checkbox">
            <FormikFormField
              name="startApplication"
              label="Start on creation"
              fastField={false}
              input={props => <CheckboxInput {...props} />}
              help={<HelpField id="cf.serverGroup.startApplication" />}
            />
          </div>
          {(values.viewState.mode === 'editPipeline' ||
            values.viewState.mode === 'createPipeline' ||
            values.viewState.mode === 'editClonePipeline') && (
            <CloudFoundryDeploymentStrategySelector
              onFieldChange={this.onStrategyFieldChange}
              onStrategyChange={this.strategyChanged}
              command={values}
            />
          )}
        </div>
      </div>
    );
  }

  public validate(values: ICloudFoundryCreateServerGroupCommand) {
    const errors = {} as FormikErrors<ICloudFoundryCreateServerGroupCommand>;

    if (values.stack && !values.stack.match(/^[a-zA-Z0-9]*$/)) {
      errors.stack = 'Stack can only contain letters and numbers.';
    }
    if (values.freeFormDetails && !values.freeFormDetails.match(/^[a-zA-Z0-9-]*$/)) {
      errors.freeFormDetails = 'Detail can only contain letters, numbers, and dashes.';
    }

    return errors;
  }
}
