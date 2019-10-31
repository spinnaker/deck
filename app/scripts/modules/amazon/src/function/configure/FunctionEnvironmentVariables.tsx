import * as React from 'react';

import { IWizardPageComponent, HelpField, MapEditor, TextInput } from '@spinnaker/core';
import { FormikProps } from 'formik';
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { IAmazonFunction } from 'amazon/domain';

export interface IFunctionEnvironmentVariablesProps {
  formik: FormikProps<IAmazonFunctionUpsertCommand>;
  isNew?: boolean;
  functionDef: IAmazonFunction;
}

export interface IFunctionEnvironmentVariablesState {
  some: string;
}

export class FunctionEnvironmentVariables
  extends React.Component<IFunctionEnvironmentVariablesProps, IFunctionEnvironmentVariablesState>
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

  private varsChanged = (envVar: { [key: string]: string }, duplicateKeys: boolean) => {
    this.duplicateKeys = duplicateKeys;
    this.props.formik.setFieldValue('envVariables', envVar);
  };

  private kmsKeyChanged = (keyArn: string) => {
    this.props.formik.setFieldValue('KMSKeyArn', keyArn);
  };

  public render() {
    const { values } = this.props.formik;
    return (
      <div className="form-group">
        <div className="col-md-11">
          <div className="sp-margin-m-bottom">
            <b>Environment Variables (optional)</b>
            <HelpField id="aws.function.env.vars" />
          </div>
          <MapEditor model={values.envVariables} allowEmpty={true} onChange={this.varsChanged} />
        </div>
        <div className="col-md-11">
          <div className="sp-margin-m-bottom">
            <b>KMS Key</b>
            <HelpField id="aws.function.kmsKeyArn" />
            <TextInput
              placeholder="Key ARN"
              onChange={(event: any) => this.kmsKeyChanged(event.target.value)}
              value={values.KMSKeyArn}
            />
          </div>
        </div>
      </div>
    );
  }
}
