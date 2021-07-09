import React from 'react';
import { IServerGroupCommandBlockDevice } from '../../../serverGroupConfiguration.service';
import Select, { Option } from 'react-select';

export const VolumeData = (props: {
  blockDevice: IServerGroupCommandBlockDevice;
  volumeTypes: string[];
  onChange: (value: any, field: string) => void;
  onDelete: () => void;
}) => {
  const { blockDevice, onChange, onDelete, volumeTypes } = props;

  return (
    <>
      <div className="form-group">
        <div className="col-md-5 sm-label-right">
          <b>Delete on Termination</b>
        </div>
        <div className="col-md-5 checkbox">
          <label>
            <input
              type="checkbox"
              checked={blockDevice.deleteOnTermination}
              onChange={(e) => onChange(e.target.checked, 'deleteOnTermination')}
            />{' '}
            Delete on Termination
          </label>
        </div>
        <div className="col-md-2">
          <a className="clickable" onClick={onDelete}>
            <span className="glyphicon glyphicon-trash" />
            <span className="sr-only">Remove field</span>
          </a>
        </div>
      </div>
      <div className="form-group">
        <div className="col-md-5 sm-label-right">
          <b>Encrypted</b>
        </div>
        <div className="col-md-5 checkbox">
          <label>
            <input
              type="checkbox"
              checked={blockDevice.encrypted}
              onChange={(e) => onChange(e.target.checked, 'encrypted')}
            />{' '}
            Encrypted
          </label>
        </div>
      </div>
      <div className="form-group">
        <div className="col-md-5 sm-label-right">
          <b>Volume Type</b>
        </div>
        <div className="col-md-6">
          <Select
            value={blockDevice.volumeType}
            clearable={false}
            placeholder="Select..."
            options={volumeTypes.map((t) => ({ label: t, value: t }))}
            onChange={(option: Option) => onChange(option.value, 'volumeType')}
          />
        </div>
      </div>
      <div className="form-group">
        <div className="col-md-5 sm-label-right">
          <b>Device Name</b>
        </div>
        <div className="col-md-5 checkbox">
          <input
            className="form-control input input-sm"
            type="text"
            value={blockDevice.deviceName}
            onChange={(e) => onChange(e.target.value, 'deviceName')}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-5 sm-label-right">
          <b>Size</b>
        </div>
        <div className="col-md-5 checkbox">
          <input
            className="form-control input input-sm"
            type="text"
            value={blockDevice.size}
            onChange={(e) => onChange(e.target.value, 'size')}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-5 sm-label-right">
          <b>Snapshot Id</b>
        </div>
        <div className="col-md-5 checkbox">
          <input
            className="form-control input input-sm"
            type="text"
            value={blockDevice.snapshotId}
            onChange={(e) => onChange(e.target.value, 'snapshotId')}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-5 sm-label-right">
          <b>Virtual Name</b>
        </div>
        <div className="col-md-5 checkbox">
          <input
            className="form-control input input-sm"
            type="text"
            value={blockDevice.virtualName}
            onChange={(e) => onChange(e.target.value, 'virtualName')}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-5 sm-label-right">
          <b>Iops</b>
        </div>
        <div className="col-md-5 checkbox">
          <input
            className="form-control input input-sm"
            type="text"
            value={blockDevice.iops}
            onChange={(e) => onChange(e.target.value, 'iops')}
          />
        </div>
      </div>
    </>
  );
};
