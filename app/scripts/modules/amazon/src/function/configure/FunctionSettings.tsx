import * as React from 'react';
import { Option } from 'react-select';

import { FormikFormField, IWizardPageComponent, TextInput, NumberInput, HelpField } from '@spinnaker/core';
import { FormikProps } from 'formik';
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { IAmazonFunction } from 'amazon/domain';

export interface IFunctionSettingsProps {
  formik: FormikProps<IAmazonFunctionUpsertCommand>;
  isNew?: boolean;
  functionDef: IAmazonFunction;
}

export interface IFunctionSettingsState {
  some: string;
}

export class FunctionSettings extends React.Component<IFunctionSettingsProps, IFunctionSettingsState>
  implements IWizardPageComponent<IAmazonFunctionUpsertCommand> {
  private duplicateKeys = false;

  public validate = () => {
    const errors = {} as any;

    if (this.duplicateKeys) {
      errors.vars = 'Variables have duplicate keys.';
    }

    return errors;
  };

  public componentDidMount() {
    this.setState({ some: '' });
  }

  public render() {
    const { errors, values } = this.props.formik;
    return (
      <div className="container-fluid form-horizontal ">
        <div className="sp-margin-m-bottom">
          <FormikFormField name="description" label="Description" input={props => <TextInput {...props} />} />
        </div>
        <div className="sp-margin-m-bottom">
          <FormikFormField
            name="memorySize"
            label="Memory (MB)"
            help={<HelpField id="aws.functionBasicSettings.memorySize" />}
            input={props => <NumberInput {...props} min={128} max={3008} />}
            value={values.memorySize}
          />
        </div>
        <div className="sp-margin-m-bottom">
          <FormikFormField
            name="timeout"
            label="Timeout (seconds)"
            help={<HelpField id="aws.functionBasicSettings.timeout" />}
            input={props => <NumberInput {...props} min={1} max={900} />}
            value={values.timeout}
          />
        </div>
        <div className="sp-margin-m-bottom">
          <FormikFormField
            name="targetGroup"
            label="Target Group Name"
            help={<HelpField id="" />}
            input={props => <TextInput {...props} />}
          />
        </div>
      </div>
    );
  }
}
