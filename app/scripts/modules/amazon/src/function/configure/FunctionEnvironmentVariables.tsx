import * as React from 'react';

import { IWizardPageComponent, HelpField, MapEditor, TextInput, FormikFormField, FormValidator } from '@spinnaker/core';
import { FormikProps } from 'formik';
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { IAmazonFunction } from 'amazon/domain';
import { awsArnValidator } from 'amazon/aws.validators';

export interface IFunctionEnvironmentVariablesProps {
  formik: FormikProps<IAmazonFunctionUpsertCommand>;
  isNew?: boolean;
  functionDef: IAmazonFunction;
}

export class FunctionEnvironmentVariables extends React.Component<IFunctionEnvironmentVariablesProps>
  implements IWizardPageComponent<IAmazonFunctionUpsertCommand> {
  public validate = (values: IAmazonFunctionUpsertCommand) => {
    const validator = new FormValidator(values);
    validator
      .field('KMSKeyArn', 'KMS Key ARN')
      .optional()
      .withValidators(awsArnValidator);
    return validator.validateForm();
  };

  private varsChanged = (envVar: { [key: string]: string }) => {
    this.props.formik.setFieldValue('envVariables', envVar);
  };

  public render() {
    const { values } = this.props.formik;
    return (
      <div className="container-fluid form-horizontal ">
        Environment Variables
        <FormikFormField
          fastField={false}
          name="envVariables"
          input={props => (
            <MapEditor {...props} model={values.envVariables} allowEmpty={true} onChange={this.varsChanged} />
          )}
        />
        {/* <FormikFormField
            fastField={false}
            name="envVariables"
            label="Environment Variables"
            input={props => <MapEditorInput {...props} allowEmptyValues={true} addButtonLabel="Add" />}
          /> */}
        <FormikFormField
          name="KMSKeyArn"
          label="Key ARN"
          help={<HelpField id="aws.function.kmsKeyArn" />}
          input={props => <TextInput {...props} />}
        />
      </div>
    );
  }
}
