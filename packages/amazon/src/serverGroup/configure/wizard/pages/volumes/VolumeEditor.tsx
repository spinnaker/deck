import React from 'react';
import { FormikErrors, FormikProps } from 'formik';
import { IServerGroupCommandBlockDevice, IVolumeListenerAction, IBlockDevicesCommand } from '../../../serverGroupConfiguration.service';
import { ConfigureVolumeConfigModal } from './ConfigureVolumeModal';
import { Application, IWizardPageComponent } from '@spinnaker/core';

export interface IVolumeEditorProps {
  app: Application;
  formik: FormikProps<IBlockDevicesCommand>;
}

export interface IVolumeEditorState {
  backingModel: IServerGroupCommandBlockDevice[];
}

export class VolumeEditor extends React.Component<IVolumeEditorProps, IVolumeEditorState>
  implements IWizardPageComponent<IBlockDevicesCommand> {
  constructor(props: IVolumeEditorProps) {
    super(props);
  }

  public validate(
    values: IBlockDevicesCommand,
  ): FormikErrors<IBlockDevicesCommand> {

    const errors = {} as any;
    const { blockDevices } = values;
    console.log(blockDevices)
    return errors;
  }

  private configureVolume = (action: IVolumeListenerAction, index: number): void => {
    ConfigureVolumeConfigModal.show({ config: action.volumeActionConfig })
      .then((config: any) => {
        action.volumeActionConfig = config;
        this.updateListeners(action.volumeActionConfig, index) // pushes change to formik, needed due to prop mutation
      })
      .catch(() => { });
  };

  private updateListeners(newValue: IServerGroupCommandBlockDevice, index: number): void {
    this.props.formik.values.blockDevices[index] = newValue;
    this.updateBlockDevices()
  }

  private updateBlockDevices(): void {
    this.props.formik.setFieldValue('blockDevices', this.props.formik.values.blockDevices);
  }


  private addBlockDevice = (): void => {
    this.props.formik.values.blockDevices = this.props.formik.values.blockDevices || [];
    const blockNew: IServerGroupCommandBlockDevice = {
      deleteOnTermination: false,
      encrypted: false,
      deviceName: '/dev/sdh',
      size: 16,
      iops: null,
      volumeType: 'gp2',
      virtualName: '',
      snapshotId: '',
    };
    this.props.formik.values.blockDevices.push(blockNew);
    this.updateBlockDevices();
  };

  private removeBlockDevice = (index: number): void => {
    this.props.formik.values.blockDevices.splice(index, 1);
    this.updateBlockDevices();
  }


  public render() {
    const { values } = this.props.formik;
    return (
      <div>
        <table className="table table-condensed table-deployStage">
          <thead>
            <tr>
              <th>Delete On Termination</th>
              <th>Encrypted</th>
              <th>Device Name</th>
              <th>Volume Type</th>
              <th>Snapshot Id</th>
              <th>Virtual Name</th>
              <th>Size</th>
              <th>Iops</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              (values.blockDevices != null) &&
              values.blockDevices.map((block, index) => (
                <tr key={index}>
                  <td>{block.deleteOnTermination ? 'Yes' : 'No'}</td>
                  <td>{block.encrypted ? 'Yes' : 'No'}</td>
                  <td>{block.deviceName}</td>
                  <td>{block.volumeType}</td>
                  <td>{block.snapshotId}</td>
                  <td>{block.virtualName}</td>
                  <td>{block.size}</td>
                  <td>{block.iops}</td>
                  <td className="condensed-actions">
                    <button
                      className="btn btn-link no-padding"
                      type="button"
                      onClick={() => this.configureVolume({ volumeActionConfig: block }, index)}>
                      <span className="glyphicon glyphicon-edit"></span>
                      <span className="sr-only">Edit</span>
                    </button>
                    <button className="btn btn-link no-padding" 
                      onClick={() => this.removeBlockDevice(index)}>
                      <span className="glyphicon glyphicon-trash" />
                      <span className="sr-only">Remove Volume</span>
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        <button type="button" className="btn btn-block btn-sm add-new"
          onClick={() => this.addBlockDevice()}>
          <span className="glyphicon glyphicon-plus-sign" />
          Add Volume
        </button>
      </div>
    );
  }
}