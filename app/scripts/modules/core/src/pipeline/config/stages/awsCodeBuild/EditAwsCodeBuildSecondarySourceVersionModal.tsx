import React from 'react';
//import { get } from 'lodash';

import { Formik, Form } from 'formik';
import { Modal } from 'react-bootstrap';
import {
  FormikFormField,
  //FormValidator,
  HelpField,
  IFormInputProps,
  ReactModal,
  SpinFormik,
  TextInput,
} from 'core';
import { SubmitButton, ModalClose } from 'core/modal';
import { IAwsCodeBuildSecondarySourcesVersion } from './IAwsCodeBuildSource';
import { IEditAwsCodeBuildSourceModalProps } from './EditAwsCodeBuildSourceModal'

export class EditAwsCodeBuildSecondarySourceVersionModal extends React.Component<IEditAwsCodeBuildSourceModalProps> {
  private formikRef = React.createRef<Formik<any>>();

  private submit = (values: IAwsCodeBuildSecondarySourcesVersion): void => {
    this.props.closeModal(values);
  };

  public static show(props: any): Promise<IAwsCodeBuildSecondarySourcesVersion> {
    const modalProps = { dialogClassName: 'modal-md' };
    return ReactModal.show(EditAwsCodeBuildSecondarySourceVersionModal, props, modalProps);
  }

  public render(): React.ReactElement<EditAwsCodeBuildSecondarySourceVersionModal> {
    const { dismissModal, secondarySourcesVersionOverride } = this.props;
    return (
      <SpinFormik<IAwsCodeBuildSecondarySourcesVersion>
        ref={this.formikRef}
        initialValues={secondarySourcesVersionOverride}
        onSubmit={this.submit}
        render={(formik) => (
          <Form className={`form-horizontal`}>
            <ModalClose dismiss={dismissModal} />
            <Modal.Header>
              <Modal.Title>Edit Source</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <FormikFormField
                help={<HelpField id="pipeline.config.codebuild.sourceIdentifier" />}
                label="Source Identifier"
                name="sourceIdentifier"
                input={(inputProps: IFormInputProps) => <TextInput {...inputProps} />}
              />
              <FormikFormField
                help={<HelpField id="pipeline.config.codebuild.sourceVersion" />}
                label="Source Version"
                name="sourceVersion"
                input={(inputProps: IFormInputProps) => <TextInput {...inputProps} />}
              />
            </Modal.Body>
            <Modal.Footer>
              <button className="btn btn-default" onClick={dismissModal} type="button">
                Cancel
              </button>
              <SubmitButton isDisabled={!formik.isValid} isFormSubmit={true} submitting={false} label={'Update'} />
            </Modal.Footer>
          </Form>
        )}
      />
    );
  }
}
