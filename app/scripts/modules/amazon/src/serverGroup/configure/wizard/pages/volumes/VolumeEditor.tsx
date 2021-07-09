import React from 'react';
import { IServerGroupCommandBlockDevice } from '../../../serverGroupConfiguration.service';
import { VolumeData } from './VolumeData';
import { isEmpty, isNil } from 'lodash';

export interface IVolumeEditorProps {
  model: IServerGroupCommandBlockDevice[];
  allowEmpty?: boolean;
  volumeTypes: string[];
  onChange: (model: IServerGroupCommandBlockDevice[]) => void;
}

export interface IVolumeEditorState {
  backingModel: IServerGroupCommandBlockDevice[];
}

export class VolumeEditor extends React.Component<IVolumeEditorProps, IVolumeEditorState> {
  constructor(props: IVolumeEditorProps) {
    super(props);

    this.state = {
      backingModel: isNil(props.model) ? [] : props.model,
    };
  }

  private onChange = (value: any, field: string, index: number) => {
    const blockNew: IServerGroupCommandBlockDevice = {
      deleteOnTermination: false,
      deviceName: '',
      size: 0,
      volumeType: '',
      encrypted: false,
      iops: 0,
      snapshotId: '',
      virtualName: '',
    };

    blockNew.deviceName = this.state.backingModel[index].deviceName;
    blockNew.deleteOnTermination = this.state.backingModel[index].deleteOnTermination;
    blockNew.encrypted = this.state.backingModel[index].encrypted;
    blockNew.size = this.state.backingModel[index].size;
    blockNew.iops = this.state.backingModel[index].iops;
    blockNew.volumeType = this.state.backingModel[index].volumeType;
    blockNew.snapshotId = this.state.backingModel[index].snapshotId;
    blockNew.virtualName = this.state.backingModel[index].virtualName;

    switch (field) {
      case 'deviceName': {
        blockNew.deviceName = value;
        break;
      }
      case 'deleteOnTermination': {
        blockNew.deleteOnTermination = Boolean(value).valueOf();
        break;
      }
      case 'volumeType': {
        blockNew.volumeType = value;
        break;
      }
      case 'size': {
        blockNew.size = Number(value);
        break;
      }
      case 'iops': {
        blockNew.iops = Number(value);
        break;
      }
      case 'encrypted': {
        blockNew.encrypted = Boolean(value).valueOf();
        break;
      }
      case 'snapshotId': {
        blockNew.snapshotId = value;
        break;
      }
      case 'virtualName': {
        blockNew.virtualName = value;
        break;
      }
    }

    if (isEmpty(blockNew.deviceName)) {
      delete blockNew.deviceName;
    }
    if (isEmpty(blockNew.volumeType)) {
      delete blockNew.volumeType;
    }
    if (blockNew.size == 0) {
      delete blockNew.size;
    }
    if (blockNew.iops == 0) {
      delete blockNew.iops;
    }
    if (isEmpty(blockNew.snapshotId)) {
      delete blockNew.snapshotId;
    }
    if (isEmpty(blockNew.virtualName)) {
      delete blockNew.virtualName;
    }

    this.state.backingModel[index] = blockNew;

    this.handleChanged();
  };

  private handleChanged() {
    const newModel = this.state.backingModel;
    this.props.onChange(newModel);
  }

  private onDelete = (index: number) => {
    this.state.backingModel.splice(index, 1);
    this.handleChanged();
  };

  private onAdd = () => {
    const blockNew: IServerGroupCommandBlockDevice = {
      deleteOnTermination: false,
      encrypted: false,
      deviceName: '',
      size: 0,
      iops: 0,
      volumeType: '',
      virtualName: '',
      snapshotId: '',
    };
    this.state.backingModel.push(blockNew);
    this.handleChanged();
  };

  public render() {
    const { backingModel } = this.state;
    const { volumeTypes } = this.props;

    return (
      <div>
        {backingModel.map((block, index) => (
          <VolumeData
            key={index}
            volumeTypes={volumeTypes}
            onChange={(value, field) => this.onChange(value, field, index)}
            onDelete={() => this.onDelete(index)}
            blockDevice={block}
          />
        ))}
        <button type="button" className="btn btn-block btn-sm add-new" onClick={this.onAdd}>
          <span className="glyphicon glyphicon-plus-sign" />
          Add Volume
        </button>
      </div>
    );
  }
}
