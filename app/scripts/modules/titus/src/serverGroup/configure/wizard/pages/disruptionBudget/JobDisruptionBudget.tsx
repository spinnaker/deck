import * as React from 'react';
import { FormikProps } from 'formik';
import { Option } from 'react-select';
import { isEqual, get } from 'lodash';

import {
  Application,
  FormikFormField,
  CheckboxInput,
  HelpField,
  TetheredSelect,
  LayoutProvider,
  ResponsiveFieldLayout,
} from '@spinnaker/core';

import { WindowPicker } from './WindowPicker';

import {
  ITitusServerGroupCommand,
  defaultJobDisruptionBudget,
  getDefaultJobDisruptionBudgetForApp,
} from '../../../serverGroupConfiguration.service';

import { IJobDisruptionBudget } from 'titus/domain';

import { rateOptions } from './RateOptions';

import { policyOptions } from './PolicyOptions';

export interface IJobDisruptionBudgetProps {
  formik: FormikProps<ITitusServerGroupCommand>;
  app: Application;
}

export interface IJobDisruptionBudgetState {
  usingDefault: boolean;
}

export interface IFieldOption extends Option {
  field: keyof IJobDisruptionBudget;
  description?: string;
  defaultValues: any;
  fieldComponent?: (props: IFieldOptionComponentProps) => JSX.Element;
}

export interface IFieldOptionComponentProps {
  isDisabled: boolean;
}

export const DisruptionBudgetDescription = () => (
  <p>
    The Job Disruption Budget is part of the job descriptor, and defines the behavior of how containers of the job can
    be relocated.{' '}
    <a href="http://manuals.test.netflix.net/view/titus-docs/mkdocs/master/disruption_budget/" target="_blank">
      Read the full documentation
    </a>
  </p>
);

export class JobDisruptionBudget extends React.Component<IJobDisruptionBudgetProps, IJobDisruptionBudgetState> {
  private timeWindowOptions: IFieldOption[] = [
    {
      field: 'timeWindows',
      label: 'Anytime',
      value: 0,
      defaultValues: undefined,
    },
    {
      field: 'timeWindows',
      label: 'Specific Time Windows',
      value: 1,
      defaultValues: defaultJobDisruptionBudget.timeWindows,
    },
  ];

  constructor(props: IJobDisruptionBudgetProps) {
    super(props);
    const { disruptionBudget } = props.formik.values;
    this.state = {
      usingDefault: !disruptionBudget || isEqual(disruptionBudget, getDefaultJobDisruptionBudgetForApp(props.app)),
    };
    if (this.state.usingDefault) {
      this.setToDefaultBudget();
    }
  }

  private setToDefaultBudget(): void {
    this.props.formik.setFieldValue('disruptionBudget', getDefaultJobDisruptionBudgetForApp(this.props.app));
  }

  private toggleUseDefault = (): void => {
    if (!this.state.usingDefault) {
      this.setToDefaultBudget();
    }
    this.setState({ usingDefault: !this.state.usingDefault });
  };

  private getSelectionFromFields(options: IFieldOption[]): IFieldOption {
    const { disruptionBudget } = this.props.formik.values;
    if (!disruptionBudget) {
      return options[0];
    }
    return options.find(o => !!disruptionBudget[o.field]);
  }

  private optionTypeChanged = (e: IFieldOption, options: IFieldOption[]) => {
    const deselected = options.filter(o => o !== e);
    deselected.forEach(o => this.props.formik.setFieldValue('disruptionBudget.' + o.field, undefined));
    this.props.formik.setFieldValue('disruptionBudget.' + e.field, e.defaultValues);
  };

  private policyTypeChanged = (e: IFieldOption) => this.optionTypeChanged(e, policyOptions);

  private rateTypeChanged = (e: IFieldOption) => this.optionTypeChanged(e, rateOptions);

  private timeWindowsChanged = (e: IFieldOption) => {
    this.props.formik.setFieldValue('disruptionBudget.' + e.field, e.defaultValues);
  };

  private getTimeWindowSelection(): IFieldOption {
    const windows = get(this.props.formik.values, 'disruptionBudget.timeWindows');
    if (windows) {
      return this.timeWindowOptions.find(o => o.defaultValues);
    }
    return this.timeWindowOptions.find(o => !o.defaultValues);
  }

  private toggleHealthProvider(provider: string) {
    const { values, setFieldValue } = this.props.formik;
    const providers = values.disruptionBudget.containerHealthProviders;
    const existing = providers.find(p => p.name === provider);
    if (existing) {
      setFieldValue('disruptionBudget.containerHealthProviders', providers.filter(p => p !== existing));
    } else {
      setFieldValue('disruptionBudget.containerHealthProviders', providers.concat({ name: provider }));
    }
  }

  public render() {
    const { usingDefault } = this.state;
    const budget = this.props.formik.values.disruptionBudget || getDefaultJobDisruptionBudgetForApp(this.props.app);

    const policyType = this.getSelectionFromFields(policyOptions);
    const PolicyFields = policyType.fieldComponent;

    const rateType = this.getSelectionFromFields(rateOptions);
    const RateFields = rateType.fieldComponent;

    const windowType = this.getTimeWindowSelection();

    const selectedProviders = budget.containerHealthProviders.map(p => p.name);

    const isSelfManaged = !!budget.selfManaged;

    return (
      <LayoutProvider value={ResponsiveFieldLayout}>
        <div className="form-horizontal sp-margin-l-xaxis">
          <DisruptionBudgetDescription />

          <FormikFormField
            name="usingDefault"
            fastField={false}
            input={() => (
              <CheckboxInput
                checked={usingDefault}
                onChange={this.toggleUseDefault}
                text={<b>Use Netflix Defaults</b>}
              />
            )}
          />

          <div style={{ opacity: usingDefault ? 0.5 : 1 }}>
            <div className="sp-formGroup">
              <div className="groupHeader">
                <FormikFormField
                  name="policyType"
                  label="Policy"
                  fastField={false}
                  input={props => (
                    <div>
                      <TetheredSelect
                        {...props}
                        menuContainerStyle={{ height: '300px' }}
                        className="Select-menu-long"
                        style={{ width: '300px' }}
                        disabled={usingDefault}
                        clearable={false}
                        onChange={this.policyTypeChanged}
                        value={policyType}
                        options={policyOptions}
                      />
                      <HelpField
                        expand={true}
                        content="A job policy defines container relocation rules and constraints"
                      />
                    </div>
                  )}
                />
              </div>
              <div className="sp-formItem">
                <p>{policyType.description}</p>
              </div>
              {PolicyFields && <PolicyFields isDisabled={usingDefault} />}
            </div>
            {!isSelfManaged && (
              <div>
                <div className={`${budget.rateUnlimited ? '' : 'sp-formGroup'}`}>
                  <div className={`${budget.rateUnlimited ? '' : 'groupHeader'}`}>
                    <FormikFormField
                      name="rates"
                      label="Rates"
                      fastField={false}
                      input={props => (
                        <TetheredSelect
                          {...props}
                          style={{ width: '300px' }}
                          disabled={usingDefault}
                          clearable={false}
                          onChange={this.rateTypeChanged}
                          value={rateType}
                          options={rateOptions}
                        />
                      )}
                    />
                  </div>
                  <div className="sp-formItem">
                    <p>{rateType.description}</p>
                  </div>
                  {RateFields && <RateFields isDisabled={usingDefault} />}
                </div>

                <div className={`${budget.timeWindows ? 'sp-formGroup' : ''}`}>
                  <div className={`${budget.timeWindows ? 'groupHeader' : ''}`}>
                    <FormikFormField
                      name="timeWindows"
                      label="When Can Disruption Occur?"
                      fastField={false}
                      input={props => (
                        <TetheredSelect
                          {...props}
                          style={{ width: '300px' }}
                          disabled={usingDefault}
                          clearable={false}
                          onChange={this.timeWindowsChanged}
                          value={windowType}
                          options={this.timeWindowOptions}
                        />
                      )}
                    />
                  </div>
                  {budget.timeWindows && <WindowPicker isDisabled={usingDefault} formik={this.props.formik} />}
                </div>
                <FormikFormField
                  name="healthProviders"
                  label="Container Health Provider"
                  fastField={false}
                  input={() => (
                    <div>
                      <CheckboxInput
                        checked={selectedProviders.includes('eureka')}
                        onChange={() => this.toggleHealthProvider('eureka')}
                        text="Discovery"
                        disabled={usingDefault}
                      />
                      <CheckboxInput
                        checked={selectedProviders.includes('atlasHealthCheckPoller')}
                        onChange={() => this.toggleHealthProvider('atlasHealthCheckPoller')}
                        text="Atlas Health Check"
                        disabled={usingDefault}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </LayoutProvider>
    );
  }
}
