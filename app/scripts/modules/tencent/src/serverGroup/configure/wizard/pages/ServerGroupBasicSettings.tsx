import * as React from 'react';
import * as DOMPurify from 'dompurify';
import { Field, FormikProps } from 'formik';
import {
  SelectInput,
  AccountSelectInput,
  DeploymentStrategySelector,
  HelpField,
  NameUtils,
  RegionSelectField,
  Application,
  ReactInjector,
  IServerGroup,
  IWizardPageComponent,
  TaskReason,
} from '@spinnaker/core';

import { ITencentImage } from '../../../../image';
import { SubnetSelectField } from 'tencent/subnet';

import { TencentImageSelectInput } from '../../TencentImageSelectInput';
import { ITencentServerGroupCommand } from '../../serverGroupConfiguration.service';

const isExpressionLanguage = (field: string) => field && field.includes('${');
const isStackPattern = (stack: string) =>
  !isExpressionLanguage(stack) ? /^([a-zA-Z_0-9._${}]*(\${.+})*)*$/.test(stack) : true;
const isDetailPattern = (detail: string) =>
  !isExpressionLanguage(detail) ? /^([a-zA-Z_0-9._${}-]*(\${.+})*)*$/.test(detail) : true;

export interface IServerGroupBasicSettingsProps {
  app: Application;
  formik: FormikProps<ITencentServerGroupCommand>;
}

export interface IServerGroupBasicSettingsState {
  selectedImage: ITencentImage;
  namePreview: string;
  createsNewCluster: boolean;
  latestServerGroup: IServerGroup;
  showPreviewAsWarning: boolean;
}

export class ServerGroupBasicSettings
  extends React.Component<IServerGroupBasicSettingsProps, IServerGroupBasicSettingsState>
  implements IWizardPageComponent<ITencentServerGroupCommand> {
  constructor(props: IServerGroupBasicSettingsProps) {
    super(props);
    const {
      amiName,
      region,
      viewState: { imageId },
    } = props.formik.values;
    const selectedImage = TencentImageSelectInput.makeFakeImage(amiName, imageId, region);
    this.state = { ...this.getStateFromProps(props), selectedImage };
  }

  private getStateFromProps(props: IServerGroupBasicSettingsProps) {
    const { app } = props;
    const { values } = props.formik;
    const { mode } = values.viewState;

    const namePreview = NameUtils.getClusterName(app.name, values.stack, values.detail);
    const createsNewCluster = !app.clusters.find(c => c.name === namePreview);
    const showPreviewAsWarning = (mode === 'create' && !createsNewCluster) || (mode !== 'create' && createsNewCluster);

    const inCluster = (app.serverGroups.data as IServerGroup[])
      .filter(serverGroup => {
        return (
          serverGroup.cluster === namePreview &&
          serverGroup.account === values.credentials &&
          serverGroup.region === values.region
        );
      })
      .sort((a, b) => a.createdTime - b.createdTime);
    const latestServerGroup = inCluster.length ? inCluster.pop() : null;

    return { namePreview, createsNewCluster, latestServerGroup, showPreviewAsWarning };
  }

  private imageChanged = (image: ITencentImage) => {
    const { setFieldValue, values } = this.props.formik;
    this.setState({ selectedImage: image });
    if (image) {
      const snapshotSet = (image && image.attributes.snapshotSet) || [];
      const osPlatform = image && image.attributes.osPlatform;
      const imageName = image && image.imageName;
      const imageId = image && image.imgIds[values.region] && image.imgIds[values.region][0];
      if (snapshotSet.length && snapshotSet.some(s => s.diskUsage === 'DATA_DISK')) {
        setFieldValue(
          'dataDisks',
          snapshotSet
            .filter(s => s.diskUsage === 'DATA_DISK')
            .map((s, index) => ({
              diskType: 'CLOUD_PREMIUM',
              diskSize: s.diskSize,
              snapshotId: s.snapshotId,
              index,
            })),
        );
      }
      setFieldValue('amiName', imageName);
      setFieldValue('imageId', imageId);
      setFieldValue('osPlatform', osPlatform);
      values.imageChanged(values);
    }
  };

  private accountUpdated = (account: string): void => {
    const { setFieldValue, values } = this.props.formik;
    values.credentials = account;
    values.credentialsChanged(values);
    setFieldValue('credentials', account);
  };

  private regionUpdated = (region: string): void => {
    const { values, setFieldValue } = this.props.formik;
    values.region = region;
    values.regionChanged(values);
    values.vpcIdChanged(values);
    setFieldValue('region', region);
  };

  private vpcIdChanged = (event: React.ChangeEvent<any>): void => {
    const { setFieldValue, values } = this.props.formik;
    values.vpcId = event.target.value;
    values.vpcIdChanged(values);
    setFieldValue('vpcId', event.target.value);
  };

  private subnetUpdated = (): void => {
    const { setFieldValue, values } = this.props.formik;
    values.subnetChanged(values);
    setFieldValue('subnetIds', values.subnetIds);
    setFieldValue('subnetType', values.subnetType);
  };

  public validate(values: ITencentServerGroupCommand): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    if (!isStackPattern(values.stack)) {
      errors.stack = 'Only dot(.) and underscore(_) special characters are allowed in the Stack field.';
    }

    if (!isDetailPattern(values.detail)) {
      errors.detail = 'Only dot(.), underscore(_), and dash(-) special characters are allowed in the Detail field.';
    }

    if (!values.viewState.disableImageSelection && !values.amiName) {
      errors.amiName = 'Image required.';
    }

    if (!values.subnetIds || !values.subnetIds.length) {
      errors.amiName = 'Subnet  required.';
    }

    return errors;
  }

  private navigateToLatestServerGroup = () => {
    const { values } = this.props.formik;
    const { latestServerGroup } = this.state;

    const params = {
      provider: values.selectedProvider,
      accountId: latestServerGroup.account,
      region: latestServerGroup.region,
      serverGroup: latestServerGroup.name,
    };

    const { $state } = ReactInjector;
    if ($state.is('home.applications.application.insight.clusters')) {
      $state.go('.serverGroup', params);
    } else {
      $state.go('^.serverGroup', params);
    }
  };

  private stackChanged = (stack: string) => {
    const { setFieldValue, values } = this.props.formik;
    values.stack = stack; // have to do it here to make sure it's done before calling values.clusterChanged
    setFieldValue('stack', stack);
    values.clusterChanged(values);
  };

  private freeFormDetailsChanged = (detail: string) => {
    const { setFieldValue, values } = this.props.formik;
    values.detail = detail; // have to do it here to make sure it's done before calling values.clusterChanged
    setFieldValue('detail', detail);
    values.clusterChanged(values);
  };

  public componentWillReceiveProps(nextProps: IServerGroupBasicSettingsProps) {
    this.setState(this.getStateFromProps(nextProps));
  }

  private handleReasonChanged = (reason: string) => {
    this.props.formik.setFieldValue('reason', reason);
  };

  private strategyChanged = (values: ITencentServerGroupCommand, strategy: any) => {
    values.onStrategyChange(values, strategy);
    this.props.formik.setFieldValue('strategy', strategy.key);
  };

  private onStrategyFieldChange = (key: string, value: any) => {
    this.props.formik.setFieldValue(key, value);
  };

  public render() {
    const { app, formik } = this.props;
    const { errors, values } = formik;
    const { createsNewCluster, latestServerGroup, namePreview, showPreviewAsWarning, selectedImage } = this.state;

    const accounts = values.backingData.accounts;
    const readOnlyFields = values.viewState.readOnlyFields || {};

    return (
      <div className="container-fluid form-horizontal">
        {values.regionIsDeprecated(values) && (
          <div className="form-group row">
            <div className="col-md-12 error-message">
              <div className="alert alert-danger">
                You are deploying into a deprecated region within the {values.credentials} account!
              </div>
            </div>
          </div>
        )}
        <div className="form-group">
          <div className="col-md-3 sm-label-right">Account</div>
          <div className="col-md-7">
            <AccountSelectInput
              value={values.credentials}
              onChange={(evt: any) => this.accountUpdated(evt.target.value)}
              readOnly={readOnlyFields.credentials}
              accounts={accounts}
              provider="tencent"
            />
          </div>
        </div>
        <RegionSelectField
          readOnly={readOnlyFields.region}
          labelColumns={3}
          component={values}
          field="region"
          account={values.credentials}
          regions={values.backingData.filtered.regions}
          onChange={this.regionUpdated}
        />
        <div className="form-group">
          <div className="col-md-3 sm-label-right">VPC</div>
          <div className="col-md-7">
            {values.region ? (
              <SelectInput
                inputClassName="form-control input-sm"
                value={values.vpcId}
                options={
                  (values.backingData.filtered.vpcList &&
                    values.backingData.filtered.vpcList.map(item => ({
                      label: `${item.name}(${item.id})`,
                      value: item.id,
                    }))) ||
                  []
                }
                onChange={this.vpcIdChanged}
              />
            ) : (
              '(Select a Region)'
            )}
          </div>
        </div>
        <SubnetSelectField
          readOnly={readOnlyFields.subnet}
          labelColumns={3}
          helpKey="tencent.serverGroup.subnet"
          component={values}
          field="subnetIds"
          region={values.region}
          application={app}
          subnets={values.backingData.filtered.subnetPurposes || []}
          onChange={this.subnetUpdated}
          multi={true}
        />
        <div className="form-group">
          <div className="col-md-3 sm-label-right">
            Stack <HelpField id="tencent.serverGroup.stack" />
          </div>
          <div className="col-md-7">
            <input
              type="text"
              className="form-control input-sm no-spel"
              value={values.stack}
              onChange={e => this.stackChanged(e.target.value)}
            />
          </div>
        </div>
        {errors.stack && (
          <div className="form-group row slide-in">
            <div className="col-sm-9 col-sm-offset-2 error-message">
              <span>{errors.stack}</span>
            </div>
          </div>
        )}
        <div className="form-group">
          <div className="col-md-3 sm-label-right">
            Detail <HelpField id="tencent.serverGroup.detail" />
          </div>
          <div className="col-md-7">
            <input
              type="text"
              className="form-control input-sm no-spel"
              value={values.detail || ''}
              onChange={e => this.freeFormDetailsChanged(e.target.value)}
            />
          </div>
        </div>
        {errors.detail && (
          <div className="form-group row slide-in">
            <div className="col-sm-9 col-sm-offset-2 error-message">
              <span>{errors.detail}</span>
            </div>
          </div>
        )}
        {values.viewState.imageSourceText && (
          <div className="form-group">
            <div className="col-md-3 sm-label-right">Image Source</div>
            <div className="col-md-7" style={{ marginTop: '5px' }}>
              <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(values.viewState.imageSourceText) }} />
            </div>
          </div>
        )}
        {!values.viewState.disableImageSelection && (
          <div className="form-group">
            <div className="col-md-3 sm-label-right">
              Image <HelpField id="tencent.serverGroup.imageName" />
            </div>
            {isExpressionLanguage(values.amiName) ? (
              <Field name="amiName" />
            ) : (
              <TencentImageSelectInput
                onChange={image => this.imageChanged(image)}
                value={selectedImage}
                application={app}
                credentials={values.credentials}
                region={values.region}
              />
            )}
          </div>
        )}
        {!values.viewState.disableStrategySelection && values.selectedProvider && (
          <DeploymentStrategySelector
            command={values}
            onFieldChange={this.onStrategyFieldChange}
            onStrategyChange={this.strategyChanged}
          />
        )}
        {!values.viewState.hideClusterNamePreview && (
          <div className="form-group">
            <div className="col-md-12">
              <div className={`well-compact ${showPreviewAsWarning ? 'alert alert-warning' : 'well'}`}>
                <h5 className="text-center">
                  <p>Your server group will be in the cluster:</p>
                  <p>
                    <strong>
                      {namePreview}
                      {createsNewCluster && <span> (new cluster)</span>}
                    </strong>
                  </p>
                  {!createsNewCluster && values.viewState.mode === 'create' && latestServerGroup && (
                    <div className="text-left">
                      <p>There is already a server group in this cluster. Do you want to clone it?</p>
                      <p>
                        Cloning copies the entire configuration from the selected server group, allowing you to modify
                        whichever fields (e.g. image) you need to change in the new server group.
                      </p>
                      <p>
                        To clone a server group, select "Clone" from the "Server Group Actions" menu in the details view
                        of the server group.
                      </p>
                      <p>
                        <a className="clickable" onClick={this.navigateToLatestServerGroup}>
                          Go to details for {latestServerGroup.name}
                        </a>
                      </p>
                    </div>
                  )}
                </h5>
              </div>
            </div>
          </div>
        )}
        <TaskReason reason={values.reason} onChange={this.handleReasonChanged} />
      </div>
    );
  }
}
