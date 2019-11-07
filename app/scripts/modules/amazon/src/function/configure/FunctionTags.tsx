import * as React from 'react';

import { IWizardPageComponent, MapEditor, FormikFormField, FormValidator } from '@spinnaker/core';
import { FormikProps } from 'formik';
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { IAmazonFunction } from 'amazon/domain';
import * as _ from 'lodash';
import { awsTagsValidator } from 'amazon/aws.validators';

export interface IFunctionTagsProps {
  formik: FormikProps<IAmazonFunctionUpsertCommand>;
  isNew?: boolean;
  functionDef: IAmazonFunction;
}

export class FunctionTags extends React.Component<IFunctionTagsProps>
  implements IWizardPageComponent<IAmazonFunctionUpsertCommand> {
  constructor(props: IFunctionTagsProps) {
    super(props);
  }
  public validate = (values: IAmazonFunctionUpsertCommand) => {
    const validator = new FormValidator(values);
    validator
      .field('tags', 'Tag')
      .required()
      .withValidators(awsTagsValidator);
    return validator.validateForm();
  };

  private varsChanged = (tag: string | { [key: string]: string }) => {
    this.props.formik.setFieldValue('tags', Array(tag));
  };

  public render() {
    const { values } = this.props.formik;
    return (
      <div className="container-fluid form-horizontal ">
        <FormikFormField
          fastField={false}
          name="tags"
          input={props => <MapEditor {...props} model={values.tags} allowEmpty={false} onChange={this.varsChanged} />}
        />
      </div>
    );
  }
}
