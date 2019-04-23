import * as React from 'react';
import { Field } from 'formik';
import Select, { Option } from 'react-select';

import { HelpField, MapEditor } from '@spinnaker/core';

import {
  ITencentServerGroupCommand,
  ITencentDisk,
} from 'tencent/serverGroup/configure/serverGroupConfiguration.service';

import { IServerGroupAdvancedSettingsProps } from './ServerGroupAdvancedSettings';

export class ServerGroupAdvancedSettingsCommon extends React.Component<IServerGroupAdvancedSettingsProps> {
  private duplicateKeys = false;

  public validate = (values: ITencentServerGroupCommand) => {
    const errors = {} as any;

    if (!values.terminationPolicies || !values.terminationPolicies.length) {
      errors.terminationPolicies = 'Termination Policies is required';
    }

    if (this.duplicateKeys) {
      errors.tags = 'Tags have duplicate keys.';
    }

    return errors;
  };

  private updateDataDisks = (): void => {
    const { setFieldValue, values } = this.props.formik;
    values.dataDisks = values.dataDisks.map((item, index) => ({
      ...item,
      index,
    }));
    setFieldValue('dataDisks', values.dataDisks);
  };

  private dataDiskTypeChange = (dataDisk: ITencentDisk, value: string) => {
    dataDisk.diskType = value;
    this.updateDataDisks();
  };

  private dataDiskSizeChange = (dataDisk: ITencentDisk, value: number) => {
    dataDisk.diskSize = value;
    this.updateDataDisks();
  };

  private dataDiskSnapshotIdChange = (dataDisk: ITencentDisk, value: string) => {
    dataDisk.snapshotId = value;
    this.updateDataDisks();
  };

  private onDeleteDataDisk = (index: number): void => {
    const { values } = this.props.formik;
    values.dataDisks.splice(index, 1);
    this.updateDataDisks();
  };

  private onAddDataDisk = () => {
    const { values } = this.props.formik;
    values.dataDisks.push({
      diskSize: 50,
      diskType: 'CLOUD_PREMIUM',
    });
    this.updateDataDisks();
  };

  private tagsChanged = (tags: { [key: string]: string }, duplicateKeys: boolean) => {
    this.duplicateKeys = duplicateKeys;
    this.props.formik.setFieldValue('tags', tags);
  };

  public render() {
    const { setFieldValue, values } = this.props.formik;

    const keyPairs = values.backingData.filtered.keyPairs || [];

    return (
      <div className="container-fluid form-horizontal">
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Cooldown</b>
          </div>
          <div className="col-md-2">
            <Field type="text" required={true} name="cooldown" className="form-control input-sm no-spel" />
          </div>{' '}
          seconds
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Termination Policies</b>
          </div>
          <div className="col-md-6">
            <Select
              required={true}
              clearable={false}
              value={values.terminationPolicies && values.terminationPolicies[0]}
              options={values.backingData.terminationPolicies.map(m => ({ label: m, value: m }))}
              onChange={(option: Option) => setFieldValue('terminationPolicies', [option.value])}
            />
          </div>
        </div>

        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Key Name</b>
          </div>
          <div className="col-md-6">
            <Select
              value={values.keyPair}
              clearable={false}
              options={keyPairs.map(t => ({ label: `${t.keyName}(${t.keyId})`, value: t.keyId }))}
              onChange={(option: Option) => setFieldValue('keyPair', option.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>UserData (optional) </b>
            <HelpField id="aws.serverGroup.base64UserData" />
          </div>
          <div className="col-md-6">
            <Field type="text" className="form-control input-sm no-spel" name="userData" />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Security Service </b>
            <HelpField id="aws.serverGroup.securityService" />
          </div>

          <div className="col-md-6 checkbox">
            <label>
              <input
                type="checkbox"
                checked={values.enhancedService.securityService.enabled}
                onChange={e =>
                  setFieldValue('enhancedService', {
                    ...values.enhancedService,
                    securityService: {
                      enabled: e.target.checked,
                    },
                  })
                }
              />{' '}
              Enable Security Service{' '}
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Instance Monitoring </b>
            <HelpField id="aws.serverGroup.instanceMonitoring" />
          </div>

          <div className="col-md-6 checkbox">
            <label>
              <input
                type="checkbox"
                checked={values.enhancedService.monitorService.enabled}
                onChange={e =>
                  setFieldValue('enhancedService', {
                    ...values.enhancedService,
                    monitorService: {
                      enabled: e.target.checked,
                    },
                  })
                }
              />{' '}
              Enable Instance Monitoring{' '}
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Network Billing</b>
          </div>
          <div className="col-md-3 radio">
            <label>
              <input
                type="radio"
                checked={values.internetAccessible.internetChargeType === 'BANDWIDTH_POSTPAID_BY_HOUR'}
                onChange={() =>
                  setFieldValue('internetAccessible', {
                    ...values.internetAccessible,
                    internetChargeType: 'BANDWIDTH_POSTPAID_BY_HOUR',
                  })
                }
              />
              Bill by Bandwidth
            </label>
          </div>
          <div className="col-md-2 radio">
            <label>
              <input
                type="radio"
                checked={values.internetAccessible.internetChargeType === 'TRAFFIC_POSTPAID_BY_HOUR'}
                onChange={() =>
                  setFieldValue('internetAccessible', {
                    ...values.internetAccessible,
                    internetChargeType: 'TRAFFIC_POSTPAID_BY_HOUR',
                  })
                }
              />
              By Traffic
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Bandwidth</b>
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control input-sm"
              value={values.internetAccessible.internetMaxBandwidthOut}
              min={0}
              max={100}
              onChange={e =>
                setFieldValue('internetAccessible', {
                  ...values.internetAccessible,
                  internetMaxBandwidthOut: e.target.value,
                })
              }
              required={true}
            />
          </div>{' '}
          Mbps
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Associate Public IP Address</b>
          </div>
          <div className="col-md-2 radio">
            <label>
              <input
                type="radio"
                checked={values.internetAccessible.publicIpAssigned === true}
                onChange={() =>
                  setFieldValue('internetAccessible', { ...values.internetAccessible, publicIpAssigned: true })
                }
                id="associatePublicIpAddressTrue"
              />
              Yes
            </label>
          </div>
          <div className="col-md-2 radio">
            <label>
              <input
                type="radio"
                checked={values.internetAccessible.publicIpAssigned === false}
                onChange={() =>
                  setFieldValue('internetAccessible', { ...values.internetAccessible, publicIpAssigned: false })
                }
                id="associatePublicIpAddressFalse"
              />
              No
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>System disk</b>
          </div>
          <div className="col-md-3" style={{ paddingRight: 0 }}>
            <Select
              required={true}
              clearable={false}
              value={values.systemDisk.diskType}
              options={values.backingData.diskTypes.map(m => ({ label: m, value: m }))}
              onChange={(option: Option) =>
                setFieldValue('systemDisk', { ...values.systemDisk, diskType: option.value })
              }
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control input-sm"
              value={values.systemDisk.diskSize}
              min={50}
              max={1024}
              onChange={e => setFieldValue('systemDisk', { ...values.systemDisk, diskSize: e.target.value })}
              required={true}
            />
          </div>{' '}
          GB
        </div>
        <div className="form-group">
          <div className="sm-label-left">
            <b>Data disk (optional)</b>
          </div>
          <div>
            <table className={`table table-condensed packed`}>
              <thead>
                <tr>
                  <th className="col-md-4">Disk Type</th>
                  <th className="col-md-4">Disk Size(GB)</th>
                  <th className="col-md-4">Snapshot ID</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {values.dataDisks.map((dataDisk, index) => (
                  <tr key={index}>
                    <td>
                      <Select
                        required={true}
                        clearable={false}
                        value={dataDisk.diskType}
                        options={values.backingData.diskTypes.map(m => ({ label: m, value: m }))}
                        onChange={(option: Option) => this.dataDiskTypeChange(dataDisk, option.value as string)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control input-sm"
                        value={dataDisk.diskSize}
                        min={10}
                        max={1024}
                        onChange={e => this.dataDiskSizeChange(dataDisk, parseInt(e.target.value, 10))}
                        required={true}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control input input-sm"
                        type="text"
                        value={dataDisk.snapshotId}
                        onChange={e => this.dataDiskSnapshotIdChange(dataDisk, e.target.value)}
                      />
                    </td>
                    <td>
                      <div className="form-control-static">
                        <a className="clickable" onClick={() => this.onDeleteDataDisk(index)}>
                          <span className="glyphicon glyphicon-trash" />
                          <span className="sr-only">Remove Data Disk</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>
                    <button type="button" className="btn btn-block btn-sm add-new" onClick={this.onAddDataDisk}>
                      <span className="glyphicon glyphicon-plus-sign" />
                      {'Add Data Disk'}
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div className="form-group">
          <div className="sm-label-left">
            <b>Tags (optional)</b>
            <HelpField id="aws.serverGroup.tags" />
          </div>
          <MapEditor model={values.tags as any} allowEmpty={true} onChange={this.tagsChanged} />
        </div>
      </div>
    );
  }
}
