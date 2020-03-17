import React from 'react';
import { FormikErrors, FormikProps } from 'formik';

import {
  AccountSelectInput,
  DeploymentStrategySelector,
  HelpField,
  NameUtils,
  Application,
  ReactInjector,
  IServerGroup,
  IWizardPageComponent,
  Markdown,
  DeployingIntoManagedClusterWarning,
  TaskReason,
  FormikFormField,
  TextInput,
  ReactSelectInput,
  RegionSelectInput,
  CheckboxInput,
  FormField,
} from '@spinnaker/core';

import { IAmazonImage } from 'amazon/image';
import { SubnetSelectInput } from 'amazon/subnet';

import { AmazonImageSelectInput } from '../../AmazonImageSelectInput';
import { IAmazonServerGroupCommand } from '../../serverGroupConfiguration.service';
import { ServerGroupDetailsField } from './fields/ServerGroupDetailsField';
import { DeployingIntoDeprecatedRegionWarning } from './notices/DeployingIntoDeprecatedRegionWarning';
import { ClusterNamePreview } from './notices/ClusterNamePreviewNotice';

const isExpressionLanguage = (field: string) => field && field.includes('${');
const isStackPattern = (stack: string) =>
  !isExpressionLanguage(stack) ? /^([a-zA-Z_0-9._${}]*(\${.+})*)*$/.test(stack) : true;
const isDetailPattern = (detail: string) =>
  !isExpressionLanguage(detail) ? /^([a-zA-Z_0-9._${}-]*(\${.+})*)*$/.test(detail) : true;

export interface IServerGroupBasicSettingsProps {
  app: Application;
  formik: FormikProps<IAmazonServerGroupCommand>;
}

export interface IServerGroupBasicSettingsState {
  selectedImage: IAmazonImage;
  namePreview: string;
  createsNewCluster: boolean;
  latestServerGroup: IServerGroup;
  showPreviewAsWarning: boolean;
}

export class ServerGroupBasicSettings
  extends React.Component<IServerGroupBasicSettingsProps, IServerGroupBasicSettingsState>
  implements IWizardPageComponent<IAmazonServerGroupCommand> {
  constructor(props: IServerGroupBasicSettingsProps) {
    super(props);
    const {
      amiName,
      region,
      viewState: { imageId },
    } = props.formik.values;
    const selectedImage = AmazonImageSelectInput.makeFakeImage(amiName, imageId, region);
    this.state = { ...this.getStateFromProps(props), selectedImage };
  }

  private getStateFromProps(props: IServerGroupBasicSettingsProps) {
    const { app } = props;
    const { values } = props.formik;
    const { mode } = values.viewState;

    const namePreview = NameUtils.getClusterName(app.name, values.stack, values.freeFormDetails);
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

  private imageChanged = (image: IAmazonImage) => {
    const { setFieldValue, values } = this.props.formik;
    this.setState({ selectedImage: image });

    const virtualizationType = image && image.attributes.virtualizationType;
    const imageName = image && image.imageName;
    values.virtualizationType = virtualizationType;
    values.amiName = imageName;
    setFieldValue('virtualizationType', virtualizationType);
    setFieldValue('amiName', imageName);
    values.imageChanged(values);
  };

  private accountUpdated = (account: string): void => {
    const { setFieldValue, values } = this.props.formik;
    values.credentials = account;
    values.credentialsChanged(values);
    values.subnetChanged(values);
    setFieldValue('credentials', account);
  };

  private regionUpdated = (region: string): void => {
    const { values, setFieldValue } = this.props.formik;
    values.region = region;
    values.regionChanged(values);
    setFieldValue('region', region);
  };

  private subnetUpdated = (subnetType: string): void => {
    const { setFieldValue, values } = this.props.formik;
    values.subnetType = subnetType;
    values.subnetChanged(values);
    setFieldValue('subnetType', values.subnetType);
  };

  public validate(values: IAmazonServerGroupCommand): FormikErrors<IAmazonServerGroupCommand> {
    const errors: FormikErrors<IAmazonServerGroupCommand> = {};

    if (!isStackPattern(values.stack)) {
      errors.stack = 'Only dot(.) and underscore(_) special characters are allowed in the Stack field.';
    }

    if (!isDetailPattern(values.freeFormDetails)) {
      errors.freeFormDetails =
        'Only dot(.), underscore(_), and dash(-) special characters are allowed in the Detail field.';
    }

    if (!values.viewState.disableImageSelection && !values.amiName) {
      errors.amiName = 'Image required.';
    }

    // this error is added exclusively to disable the "create/clone" button - it is not visible aside from the warning
    // rendered by the DeployingIntoManagedClusterWarning component
    if (values.resourceSummary) {
      errors.resourceSummary = { id: 'Cluster is managed' };
    }

    return errors;
  }

  private clientRequestsChanged = () => {
    const { values, setFieldValue } = this.props.formik;
    values.toggleSuspendedProcess(values, 'AddToLoadBalancer');
    setFieldValue('suspendedProcesses', values.suspendedProcesses);
    this.setState({});
  };

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

  public componentWillReceiveProps(nextProps: IServerGroupBasicSettingsProps) {
    this.setState(this.getStateFromProps(nextProps));
  }

  private handleReasonChanged = (reason: string) => {
    this.props.formik.setFieldValue('reason', reason);
  };

  private strategyChanged = (values: IAmazonServerGroupCommand, strategy: any) => {
    values.onStrategyChange(values, strategy);
    this.props.formik.setFieldValue('strategy', strategy.key);
  };

  private onStrategyFieldChange = (key: string, value: any) => {
    this.props.formik.setFieldValue(key, value);
  };

  public render() {
    const { app, formik } = this.props;
    const { values } = formik;
    const { createsNewCluster, latestServerGroup, namePreview, showPreviewAsWarning } = this.state;

    const accounts = values.backingData.accounts;
    const readOnlyFields = values.viewState.readOnlyFields || {};

    return (
      <div className="container-fluid form-horizontal">
        {values.regionIsDeprecated(values) ? (
          <DeployingIntoDeprecatedRegionWarning credentials={values.credentials} />
        ) : null}

        <DeployingIntoManagedClusterWarning app={app} formik={formik} />

        <FormikFormField
          label="Account"
          name="credentials"
          input={props => (
            <AccountSelectInput
              {...props}
              accounts={accounts}
              provider="aws"
              readOnly={readOnlyFields.credentials}
              onChange={e => this.accountUpdated(e.target.value)}
            />
          )}
        />

        <FormikFormField
          label="Region"
          name="region"
          input={props => (
            <RegionSelectInput
              {...props}
              account={values.credentials}
              readOnly={readOnlyFields.region}
              regions={values.backingData.filtered.regions}
              onChange={e => this.regionUpdated(e.target.value)}
            />
          )}
        />

        <FormikFormField
          label="VPC Subnet"
          name="subnetType"
          help={<HelpField id="aws.serverGroup.subnet" />}
          input={({ value, ...props }) =>
            values.region ? (
              <SubnetSelectInput
                {...props}
                application={app}
                credentials={values.credentials}
                readOnly={readOnlyFields.subnet}
                region={values.region}
                subnets={values.backingData.filtered.subnetPurposes}
                value={value}
                onChange={e => this.subnetUpdated(e.target.value)}
              />
            ) : (
              <ReactSelectInput
                disabled={true}
                options={[{ value: 'disabled', label: '(Select an account)' }]}
                value="disabled"
              />
            )
          }
        />

        <FormikFormField
          label="Stack"
          name="stack"
          help={<HelpField id="aws.serverGroup.stack" />}
          input={props => <TextInput {...props} onChange={e => this.stackChanged(e.target.value)} />}
        />

        <ServerGroupDetailsField formik={formik} />

        {values.viewState.imageSourceText && (
          <FormField
            label="Image Source"
            name="viewState.imageSourceText"
            input={() => <Markdown tag="span" message={values.viewState.imageSourceText} />}
          />
        )}

        {!values.viewState.disableImageSelection && (
          <FormikFormField
            label="Image"
            name="amiName"
            help={<HelpField id="aws.serverGroup.imageName" />}
            input={props =>
              isExpressionLanguage(values.amiName) ? (
                <TextInput {...props} />
              ) : (
                <AmazonImageSelectInput
                  application={app}
                  credentials={values.credentials}
                  region={values.region}
                  value={this.state.selectedImage}
                  onChange={image => this.imageChanged(image)}
                />
              )
            }
          />
        )}

        <FormikFormField
          label="Traffic"
          name="suspendedProcesses"
          help={<HelpField id="aws.serverGroup.traffic" />}
          input={({ value }) => (
            <CheckboxInput
              checked={value.includes('AddToLoadBalancer')}
              disabled={values.strategy !== '' && values.strategy !== 'custom'}
              text="Send client requests to new instances"
              onChange={this.clientRequestsChanged}
            />
          )}
        />

        {!values.viewState.disableStrategySelection && values.selectedProvider && (
          <DeploymentStrategySelector
            command={values}
            useSystemLayout={true}
            onFieldChange={this.onStrategyFieldChange}
            onStrategyChange={this.strategyChanged}
          />
        )}

        {!values.viewState.hideClusterNamePreview && (
          <ClusterNamePreview
            createsNewCluster={createsNewCluster}
            latestServerGroup={latestServerGroup}
            mode={values.viewState.mode}
            namePreview={namePreview}
            navigateToLatestServerGroup={this.navigateToLatestServerGroup}
            showPreviewAsWarning={showPreviewAsWarning}
          />
        )}

        <TaskReason reason={values.reason} useSystemLayout={true} onChange={this.handleReasonChanged} />
      </div>
    );
  }
}
