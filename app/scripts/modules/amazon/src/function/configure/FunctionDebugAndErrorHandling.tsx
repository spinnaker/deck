import * as React from 'react';

import { FormikFormField, IWizardPageComponent, HelpField, TextInput, ReactSelectInput } from '@spinnaker/core';
import { FormikProps } from 'formik';
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
  public validate = () => {
    const errors = {} as any;
    return errors;
  };

  public componentDidMount() {
    this.setState({ some: '' });
  }

  public render() {
    const { values } = this.props.formik;
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
