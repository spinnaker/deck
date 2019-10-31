import * as React from 'react';

import {
  FormikFormField,
  IWizardPageComponent,
  HelpField,
  TextInput,
  ReactSelectInput,
  ValidationMessage,
} from '@spinnaker/core';
import { FormikProps, FormikErrors } from 'formik';
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { IAmazonFunction } from 'amazon/domain';

export interface IFunctionDebugAndErrorHandlingProps {
  formik: FormikProps<IAmazonFunctionUpsertCommand>;
  isNew?: boolean;
  functionDef: IAmazonFunction;
}

export interface IFunctionDebugAndErrorHandlingState {
  some: string;
}

export class FunctionDebugAndErrorHandling
  extends React.Component<IFunctionDebugAndErrorHandlingProps, IFunctionDebugAndErrorHandlingState>
  implements IWizardPageComponent<IAmazonFunctionUpsertCommand> {
  constructor(props: IFunctionDebugAndErrorHandlingProps) {
    super(props);
  }
  public validate = (values: IAmazonFunctionUpsertCommand): FormikErrors<IAmazonFunctionUpsertCommand> => {
    const errors = {} as any;
    if (
      values.deadLetterConfig.targetArn &&
      !values.deadLetterConfig.targetArn.match(/arn:aws[a-zA-Z-]?:[a-zA-Z_0-9.-]+:./)
    ) {
      errors.deadLetterConfig = 'Invalid target ARN.';
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
          Dead Letter Config
          <FormikFormField
            name="deadLetterConfig.targetArn"
            label="Target ARN"
            help={<HelpField id="aws.function.deadletterqueue" />}
            input={props => <TextInput {...props} />}
          />
          {errors.deadLetterConfig && <ValidationMessage type="error" message={errors.deadLetterConfig} />}
        </div>
        <div className="sp-margin-m-bottom">
          X-Ray Tracing
          <FormikFormField
            name="tracingConfig.mode"
            label="Mode"
            help={<HelpField id="aws.function.tracingConfig.mode" />}
            input={props => (
              <ReactSelectInput
                {...props}
                inputClassName="cloudfoundry-react-select"
                stringOptions={['Active', 'PassThrough']}
                clearable={true}
                value={values.tracingConfig.mode}
              />
            )}
          />
        </div>
      </div>
    );
  }
}
