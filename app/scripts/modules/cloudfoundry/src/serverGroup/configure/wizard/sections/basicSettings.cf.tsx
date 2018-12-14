import * as React from 'react';

import { FormikErrors } from 'formik';

import {
  AccountService,
  CheckboxInput,
  FormikFormField,
  IAccount,
  IRegion,
  IWizardPageProps,
  wizardPage,
  HelpField,
  ReactSelectInput,
  TextInput,
} from '@spinnaker/core';

import { ICloudFoundryCreateServerGroupCommand } from '../../serverGroupConfigurationModel.cf';
import { CloudFoundryDeploymentStrategySelector } from 'cloudfoundry/deploymentStrategy/CloudFoundryDeploymentStrategySelector';

import 'cloudfoundry/common/cloudFoundry.less';

export type ICloudFoundryServerGroupBasicSettingsProps = IWizardPageProps<ICloudFoundryCreateServerGroupCommand>;

export interface ICloudFoundryServerGroupLocationSettingsState {
  account: string;
  accounts: IAccount[];
  regions: IRegion[];
}

class BasicSettingsImpl extends React.Component<
  ICloudFoundryServerGroupBasicSettingsProps,
  ICloudFoundryServerGroupLocationSettingsState
> {
  public static get LABEL() {
    return 'Basic Settings';
  }

  public state: ICloudFoundryServerGroupLocationSettingsState = {
    account: '',
    accounts: [],
    regions: [],
  };

  public componentDidMount(): void {
    AccountService.listAccounts('cloudfoundry').then(accounts => {
      this.setState({ accounts });
      this.updateRegionList();
    });
  }

  private accountChanged = (): void => {
    this.updateRegionList();
    this.props.formik.setFieldValue('region', '');
  };

  private updateRegionList = (): void => {
    const { credentials } = this.props.formik.values;
    if (credentials) {
      AccountService.getRegionsForAccount(credentials).then(regions => {
        this.setState({ regions: regions });
      });
    }
  };

  private strategyChanged = (_values: ICloudFoundryCreateServerGroupCommand, strategy: any) => {
    this.props.formik.setFieldValue('strategy', strategy.key);
  };

  private onStrategyFieldChange = (key: string, value: any) => {
    this.props.formik.setFieldValue(key, value);
  };

  public render(): JSX.Element {
    const { accounts, regions } = this.state;
    const { values } = this.props.formik;
    return (
      <div className="form-group">
        <div className="col-md-9">
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
          {(values.viewState.mode === 'editPipeline' || values.viewState.mode === 'createPipeline') && (
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

export const CloudFoundryServerGroupBasicSettings = wizardPage(BasicSettingsImpl);
