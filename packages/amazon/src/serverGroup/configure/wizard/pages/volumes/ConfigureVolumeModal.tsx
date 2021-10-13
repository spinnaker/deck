import { Form } from 'formik';
import React from 'react';
import { Modal } from 'react-bootstrap';

import {
  FormikFormField,
  CheckboxInput,
  HelpField,
  ModalClose,
  noop,
  NumberInput,
  ReactModal,
  SelectInput,
  SpinFormik,
  SubmitButton,
  TextInput,
} from '@spinnaker/core';
import { IServerGroupCommandBlockDevice } from '../../../serverGroupConfiguration.service';

import './ConfigureConfigModal.css';

export interface IConfigureVolumeConfigModalProps {
  config: IServerGroupCommandBlockDevice;
  closeModal?(result?: any): void; // provided by ReactModal
  dismissModal?(rejection?: any): void; // provided by ReactModal
}

export class ConfigureVolumeConfigModal extends React.Component<IConfigureVolumeConfigModalProps> {
  private initialValues: IServerGroupCommandBlockDevice;
  private volumeTypes = ['gp2', 'gp3', 'st1', 'io1', 'io2', 'sc1'];

  public static defaultProps: Partial<IConfigureVolumeConfigModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static show(props: IConfigureVolumeConfigModalProps): Promise<void> {
    return ReactModal.show(ConfigureVolumeConfigModal, props);
  }

  constructor(props: IConfigureVolumeConfigModalProps) {
    super(props);

    const config = props.config || ({} as IServerGroupCommandBlockDevice);

    this.initialValues = {
      deviceName: config.deviceName || '/dev/sdh',
      deleteOnTermination: config.deleteOnTermination,
      size: config.size || 16,
      volumeType: config.volumeType || 'gp2',
      virtualName: config.virtualName || '',
      iops: config.iops,
      snapshotId: config.snapshotId || '',
      encrypted: config.encrypted,
    };
  }

  private close = (reason?: null): void => {
    this.props.dismissModal(reason);
  };

  private submit = (data: IServerGroupCommandBlockDevice): void => {
    this.props.closeModal(data);
  };

  public render() {
    const submitLabel = 'Save Device';

    return (
      <div className="configure-config-modal">
        <SpinFormik<IServerGroupCommandBlockDevice>
          initialValues={this.initialValues}
          onSubmit={this.submit}
          render={({ isValid }) => (
            <Form className="form-horizontal">
              <ModalClose dismiss={this.close} />
              <Modal.Header>
                <Modal.Title>
                  Configure Volume
                </Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <FormikFormField 
                  name="deleteOnTermination" 
                  label="Delete on Termination" 
                  help={<HelpField id="aws.securityGroup.volume.delete.on.termination" />}
                  input={(props) => <CheckboxInput {...props} />} />

                <FormikFormField 
                  name="encrypted" 
                  label="Encrypted" 
                  help={<HelpField id="aws.securityGroup.volume.encrypted" />}
                  input={(props) => <CheckboxInput {...props} />} />

                <FormikFormField
                  name="deviceName"
                  label="Device Name"
                  required={true}
                  input={(props) => <TextInput {...props} />}
                  help={<HelpField id="aws.securityGroup.volume.devicename" />}
                />

                <FormikFormField
                  name="volumeType"
                  label="Volune Type"
                  required={true}
                  help={<HelpField id="aws.securityGroup.volume.type" />}
                  input={(props) => (
                    <SelectInput
                      options={this.volumeTypes}
                      {...props}
                    />
                  )}
                />

                <FormikFormField
                  name="virtualName"
                  label="Virtual Name"
                  required={false}
                  input={(props) => <TextInput {...props} />}
                  help={<HelpField id="aws.securityGroup.volume.virtual.name" />}
                />

                <FormikFormField
                  name="snapshotId"
                  label="Snapshot Id"
                  required={false}
                  input={(props) => <TextInput {...props} />}
                  help={<HelpField id="aws.securityGroup.volume.snapshot" />}
                />

                <FormikFormField
                  name="size"
                  label="Size"
                  required={true}
                  input={(props) => <NumberInput {...props} />}
                  help={<HelpField id="aws.securityGroup.volume.size" />}
                />

                <FormikFormField
                  name="iops"
                  label="Iops"
                  required={false}
                  input={(props) => <NumberInput {...props} />}
                  help={<HelpField id="aws.securityGroup.volume.iops" />}
                /> 
              </Modal.Body>

              <Modal.Footer>
                <button className="btn btn-default" onClick={this.close} type="button">
                  Cancel
                </button>
                <SubmitButton isDisabled={!isValid} submitting={false} isFormSubmit={true} label={submitLabel} />
              </Modal.Footer>
            </Form>
          )}
        />
      </div>
    );
  }
}
