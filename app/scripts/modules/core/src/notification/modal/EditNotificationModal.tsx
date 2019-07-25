import * as React from 'react';

import { Formik, Form } from 'formik';
import { Modal } from 'react-bootstrap';
import { buildValidators, IModalComponentProps, ReactModal, SpinFormik } from 'core/presentation';
import { INotification } from 'core/domain';
import { SubmitButton, ModalClose } from 'core/modal';

import { NotificationDetails } from './NotificationDetails';

export interface IEditNotificationModalProps extends IModalComponentProps {
  level: string;
  notification: INotification;
  stageType: string;
}

export class EditNotificationModal extends React.Component<IEditNotificationModalProps> {
  private formikRef = React.createRef<Formik<any>>();

  private submit = (values: INotification): void => {
    this.props.closeModal(values);
  };

  public static show(props: any): Promise<INotification> {
    const modalProps = { dialogClassName: 'modal-md' };
    return ReactModal.show(EditNotificationModal, props, modalProps);
  }

  private validate = (values: INotification): any => {
    const validation = buildValidators(values);
    validation
      .field('when', 'Notify when')
      .required([(value: any[]) => !value.length && 'Please select when the notification should execute']);
    return validation.result();
  };

  public render(): React.ReactElement<EditNotificationModal> {
    const { dismissModal, level, notification, stageType } = this.props;
    return (
      <SpinFormik<INotification>
        ref={this.formikRef}
        initialValues={notification}
        onSubmit={this.submit}
        validate={this.validate}
        render={formik => (
          <Form className={`form-horizontal`}>
            <ModalClose dismiss={dismissModal} />
            <Modal.Header>
              <Modal.Title>Edit Notification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className={'row'}>
                <div className="container-fluid modal-body-content">
                  <NotificationDetails formik={formik} level={level} stageType={stageType} />
                </div>
              </div>
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
