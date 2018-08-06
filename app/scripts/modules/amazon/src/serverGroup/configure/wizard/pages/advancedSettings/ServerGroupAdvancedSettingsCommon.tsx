import * as React from 'react';
import { Field, FormikProps } from 'formik';
import Select, { Option } from 'react-select';

import { IWizardPageProps, HelpField, MapEditor, PlatformHealthOverride } from '@spinnaker/core';

import { AWSProviderSettings } from 'amazon/aws.settings';
import { IAmazonServerGroupCommand } from 'amazon/serverGroup/configure/serverGroupConfiguration.service';

import { IServerGroupAdvancedSettingsProps } from './ServerGroupAdvancedSettings';

export class ServerGroupAdvancedSettingsCommon extends React.Component<
  IServerGroupAdvancedSettingsProps & IWizardPageProps & FormikProps<IAmazonServerGroupCommand>
> {
  private duplicateKeys = false;

  public validate = (values: IAmazonServerGroupCommand): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    if (!values.keyPair) {
      errors.keyPair = 'Key Name is required';
    }
    if (this.duplicateKeys) {
      errors.tags = 'Tags have duplicate keys.';
    }

    return errors;
  };

  private selectBlockDeviceMappingsSource = (source: string) => {
    this.props.values.selectBlockDeviceMappingsSource(this.props.values, source);
    this.setState({});
  };

  private toggleSuspendedProcess = (process: string) => {
    this.props.values.toggleSuspendedProcess(this.props.values, process);
    this.setState({});
  };

  private platformHealthOverrideChanged = (healthNames: string[]) => {
    this.props.setFieldValue('interestingHealthProviderNames', healthNames);
  };

  private tagsChanged = (tags: { [key: string]: string }, duplicateKeys: boolean) => {
    this.duplicateKeys = duplicateKeys;
    this.props.setFieldValue('tags', tags);
  };

  public render() {
    const { app, setFieldValue, values } = this.props;

    const blockDeviceMappingsSource = values.getBlockDeviceMappingsSource(values);

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
            <b>Enabled Metrics </b>
            <HelpField id="aws.serverGroup.enabledMetrics" />
          </div>
          <div className="col-md-6">
            <Select
              multi={true}
              value={values.enabledMetrics}
              options={values.backingData.enabledMetrics.map(m => ({ label: m, value: m }))}
              onChange={(option: Option[]) => setFieldValue('enabledMetrics', option.map(o => o.value))}
            />
          </div>
        </div>

        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Health Check Type</b>
          </div>
          <div className="col-md-6">
            <Select
              value={values.healthCheckType}
              clearable={false}
              placeholder="Select..."
              options={values.backingData.healthCheckTypes.map(t => ({ label: t, value: t }))}
              onChange={(option: Option) => setFieldValue('healthCheckType', option.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Health Check Grace Period</b>
          </div>
          <div className="col-md-2">
            <Field
              type="text"
              required={true}
              className="form-control input-sm no-spel"
              name="healthCheckGracePeriod"
            />
          </div>{' '}
          seconds
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Termination Policies</b>
          </div>
          <div className="col-md-6">
            <Select
              multi={true}
              value={values.terminationPolicies}
              options={values.backingData.terminationPolicies.map(m => ({ label: m, value: m }))}
              onChange={(option: Option[]) => setFieldValue('terminationPolicies', option.map(o => o.value))}
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
              required={true}
              clearable={false}
              options={values.backingData.filtered.keyPairs.map(t => ({ label: t, value: t }))}
              onChange={(option: Option) => setFieldValue('keyPair', option.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Ramdisk Id (optional)</b>
          </div>
          <div className="col-md-6">
            <Field type="text" name="ramdiskId" className="form-control input-sm no-spel" />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>IAM Instance Profile (optional)</b>
          </div>
          <div className="col-md-6">
            <input type="text" className="form-control input-sm no-spel" name="iamRole" />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>UserData (optional) </b>
            <HelpField id="aws.serverGroup.base64UserData" />
          </div>
          <div className="col-md-6">
            <input type="text" className="form-control input-sm no-spel" name="base64UserData" />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Instance Monitoring </b>
            <HelpField id="aws.serverGroup.instanceMonitoring" />
          </div>

          <div className="col-md-6 checkbox">
            <label>
              <input type="checkbox" ng-model="$ctrl.command.instanceMonitoring" /> Enable Instance Monitoring{' '}
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>EBS Optimized</b>
          </div>
          <div className="col-md-6 checkbox">
            <label>
              <input type="checkbox" ng-model="$ctrl.command.ebsOptimized" /> Optimize Instances for EBS
            </label>
          </div>
        </div>
        {!AWSProviderSettings.disableSpotPricing && (
          <div className="form-group">
            <div className="col-md-5 sm-label-right">
              <b>Spot Instances Price (optional)</b> <HelpField id="aws.serverGroup.spotPrice" />
            </div>
            <div className="col-md-2">
              <Field type="text" className="form-control input-sm" name="spotPrice" />
            </div>
          </div>
        )}
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>AMI Block Device Mappings</b>
          </div>
          <div className="col-md-6 radio">
            <div>
              <label>
                <input
                  type="radio"
                  onChange={() => this.selectBlockDeviceMappingsSource('source')}
                  checked={blockDeviceMappingsSource === 'source'}
                  name="blockDeviceMappingsSource"
                />
                Copy from current server group <HelpField id="aws.blockDeviceMappings.useSource" />
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  onChange={() => this.selectBlockDeviceMappingsSource('ami')}
                  checked={blockDeviceMappingsSource === 'ami'}
                  name="blockDeviceMappingsSource"
                />
                Prefer AMI block device mappings <HelpField id="aws.blockDeviceMappings.useAMI" />
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  onChange={() => this.selectBlockDeviceMappingsSource('default')}
                  checked={blockDeviceMappingsSource === 'default'}
                  name="blockDeviceMappingsSource"
                />
                Defaults for selected instance type <HelpField id="aws.blockDeviceMappings.useDefaults" />
              </label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Associate Public IP Address</b>
          </div>
          <div className="col-md-2 radio">
            <label>
              <input
                type="radio"
                checked={values.associatePublicIpAddress === true}
                onChange={() => setFieldValue('associatePublicIpAddress', true)}
                id="associatePublicIpAddressTrue"
              />
              Yes
            </label>
          </div>
          <div className="col-md-2 radio">
            <label>
              <input
                type="radio"
                checked={values.associatePublicIpAddress === false}
                onChange={() => setFieldValue('associatePublicIpAddress', false)}
                id="associatePublicIpAddressFalse"
              />
              No
            </label>
          </div>
          <div className="col-md-2 radio">
            <label>
              <input
                type="radio"
                checked={values.associatePublicIpAddress === null}
                onChange={() => setFieldValue('associatePublicIpAddress', null)}
                id="associatePublicIpAddressDefault"
              />
              Default
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-5 sm-label-right">
            <b>Scaling Processes</b>
          </div>
          <div className="col-md-6 checkbox">
            {values.backingData.scalingProcesses.map(process => (
              <div key={process.name}>
                <label>
                  <input
                    type="checkbox"
                    onChange={() => this.toggleSuspendedProcess(process.name)}
                    checked={!values.suspendedProcesses.includes(process.name)}
                  />{' '}
                  {process.name} <HelpField content={process.description} />
                </label>
              </div>
            ))}
          </div>
        </div>
        {app.attributes.platformHealthOnlyShowOverride && (
          <div className="form-group">
            <div className="col-md-5 sm-label-right">
              <b>Task Completion</b>
            </div>
            <div className="col-md-6">
              <PlatformHealthOverride
                command={values}
                platformHealthType="Amazon"
                onChange={this.platformHealthOverrideChanged}
              />
            </div>
          </div>
        )}
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
