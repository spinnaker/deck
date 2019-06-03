import * as React from 'react';

import { WizardModal, WizardPage } from 'core/modal/';
import { IModalComponentProps, ReactModal } from 'core/presentation';
import { INotification } from 'core/domain';

import { NotificationDetails } from './NotificationDetails';

export interface IEditNotificationModalProps extends IModalComponentProps {
  level: string;
  notification: INotification;
  stageType: string;
}

export class EditNotificationModal extends React.Component<IEditNotificationModalProps> {
  private submit = (values: INotification): void => {
    this.props.closeModal(values);
  };

  public static show(props: any): Promise<INotification> {
    const modalProps = { dialogClassName: 'modal-md' };
    return ReactModal.show(EditNotificationModal, props, modalProps);
  }

  public render(): React.ReactElement<EditNotificationModal> {
    const { dismissModal, level, notification, stageType } = this.props;
    return (
      <WizardModal<INotification>
        closeModal={this.submit}
        dismissModal={dismissModal}
        heading={'Edit Notification'}
        hideWizardNavigation={true}
        initialValues={notification}
        submitButtonLabel={'Update'}
        render={({ formik, nextIdx, wizard }) => (
          <div className="container-fluid notification-details">
            <WizardPage
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => (
                <NotificationDetails formik={formik} level={level} ref={innerRef} stageType={stageType} />
              )}
            />
          </div>
        )}
      />
    );
  }
}
