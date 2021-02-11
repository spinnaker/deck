import React from 'react';
import { FormikProps } from 'formik';
import { IServerGroupCommandBlockDevice } from '../../../serverGroupConfiguration.service';
import { VolumeEditor } from './VolumeEditor';

import { Application, IServerGroup, IWizardPageComponent, MapEditor, HelpField } from '@spinnaker/core';

import { IAmazonServerGroupCommand } from '../../../serverGroupConfiguration.service';
import { isNil } from 'lodash';

export interface IServerGroupVolumesProps {
  app: Application;
  formik: FormikProps<IAmazonServerGroupCommand>;
}

export interface IServerGroupVolumesState {
  namePreview: string;
  createsNewCluster: boolean;
  latestServerGroup: IServerGroup;
}

export class ServerGroupVolumes
  extends React.Component<IServerGroupVolumesProps, IServerGroupVolumesState>
  implements IWizardPageComponent<IAmazonServerGroupCommand> {
  private duplicateKeys = false;

  public validate() {
    const errors = {} as any;

    if (this.duplicateKeys) {
      errors.tags = 'Tags have duplicate keys.';
    }

    return errors;
  }

  private blockChange = (volumes: IServerGroupCommandBlockDevice[]) => {
    this.props.formik.setFieldValue('blockDevices', volumes);
  };

  private tagsChanged = (tags: { [key: string]: string }, duplicateKeys: boolean) => {
    this.duplicateKeys = duplicateKeys;
    this.props.formik.setFieldValue('blockDevicesTags', tags);
  };

  constructor(props: IServerGroupVolumesProps) {
    super(props);
  }

  public render() {
    const { values } = this.props.formik;
    const blockTags = isNil(values.blockDevicesTags) ? [] : values.blockDevicesTags;

    return (
      <div className="container-fluid form-horizontal">
        <div className="form-group">
          <div className="sm-label-left">
            <b>Volumes (optional)</b>
          </div>
          <VolumeEditor
            volumeTypes={values.backingData.volumeTypes}
            model={values.blockDevices}
            onChange={this.blockChange}
          />
        </div>
        <div className="form-group">
          <div className="sm-label-left">
            <b>Tags (optional)</b>
            <HelpField id="aws.serverGroup.blockDevice.tags" />
          </div>
          <MapEditor model={blockTags as any} allowEmpty={true} onChange={this.tagsChanged} />
        </div>
      </div>
    );
  }
}
