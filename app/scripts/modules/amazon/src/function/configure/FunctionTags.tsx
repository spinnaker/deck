import * as React from 'react';

import { IWizardPageComponent, MapEditor } from '@spinnaker/core';
import { FormikProps } from 'formik';
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { IAmazonFunction } from 'amazon/domain';

export interface IFunctionTagsProps {
  formik: FormikProps<IAmazonFunctionUpsertCommand>;
  isNew?: boolean;
  functionDef: IAmazonFunction;
}

export interface IFunctionTagsState {
  some: string;
}

export class FunctionTags extends React.Component<IFunctionTagsProps, IFunctionTagsState>
  implements IWizardPageComponent<IAmazonFunctionUpsertCommand> {
  private duplicateKeys = false;

  public validate = () => {
    const errors = {} as any;

    if (this.duplicateKeys) {
      errors.vars = 'Tags have duplicate keys.';
    }

    return errors;
  };

  public componentDidMount() {
    this.setState({ some: '' });
  }

  private varsChanged = (tag: [{ [key: string]: string }], duplicateKeys: boolean) => {
    this.duplicateKeys = duplicateKeys;
    this.props.formik.setFieldValue('tags', Array(tag));
  };

  public render() {
    const { values } = this.props.formik;
    return (
      <div className="form-group">
        <div className="col-md-11">
          <div className="sp-margin-m-bottom">
            <MapEditor model={values.tags} allowEmpty={true} onChange={this.varsChanged} required={true} />
          </div>
        </div>
      </div>
    );
  }
}
