import React from 'react';
import { FormikProps } from 'formik';

import { FormikFormField, HelpField, Overridable, TextInput } from '@spinnaker/core';
import { IAmazonServerGroupCommand } from '../../../serverGroupConfiguration.service';

export interface DetailsFieldProps {
  formik: FormikProps<IAmazonServerGroupCommand>;
}

@Overridable('aws.serverGroup.configure.detailsField')
export class ServerGroupDetailsField extends React.Component<DetailsFieldProps> {
  private freeFormDetailsChanged = (freeFormDetails: string) => {
    const { setFieldValue, values } = this.props.formik;
    values.freeFormDetails = freeFormDetails; // have to do it here to make sure it's done before calling values.clusterChanged
    setFieldValue('freeFormDetails', freeFormDetails);
    values.clusterChanged(values);
  };

  render() {
    return (
      <>
        <FormikFormField
          label="Details"
          name="freeFormDetails"
          help={<HelpField id="aws.serverGroup.detail" />}
          input={({ onChange, ...props }) => (
            <TextInput {...props} onChange={e => this.freeFormDetailsChanged(e.target.value)} />
          )}
        />
      </>
    );
  }
}
