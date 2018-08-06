import * as React from 'react';
import { Option } from 'react-select';
import { FormikProps } from 'formik';
import { Observable, Subject } from 'rxjs';

import {
  NgReact,
  HelpField,
  IWizardPageProps,
  wizardPage,
  NameUtils,
  RegionSelectField,
  Application,
  ReactInjector,
  TetheredSelect,
  IServerGroup,
  TaskReason,
} from '@spinnaker/core';

import { AwsNgReact } from 'amazon/reactShims';

import { IAmazonServerGroupCommand } from '../../serverGroupConfiguration.service';

const isNotExpressionLanguage = (field: string) => field && !field.includes('${');
const isStackPattern = (stack: string) =>
  isNotExpressionLanguage(stack) ? /^([a-zA-Z_0-9._${}]*(\${.+})*)*$/.test(stack) : true;
const isDetailPattern = (detail: string) =>
  isNotExpressionLanguage(detail) ? /^([a-zA-Z_0-9._${}-]*(\${.+})*)*$/.test(detail) : true;

export interface IServerGroupBasicSettingsProps {
  app: Application;
}

export interface IServerGroupBasicSettingsState {
  images: any[];
  namePreview: string;
  createsNewCluster: boolean;
  latestServerGroup: IServerGroup;
  showPreviewAsWarning: boolean;
}

class ServerGroupBasicSettingsImpl extends React.Component<
  IServerGroupBasicSettingsProps & IWizardPageProps & FormikProps<IAmazonServerGroupCommand>,
  IServerGroupBasicSettingsState
> {
  public static LABEL = 'Basic Settings';

  private imageSearchResultsStream = new Subject();

  // TODO: Extract the image selector into another component
  constructor(props: IServerGroupBasicSettingsProps & IWizardPageProps & FormikProps<IAmazonServerGroupCommand>) {
    super(props);
    const { disableImageSelection } = props.values.viewState;
    this.state = {
      images: disableImageSelection ? [] : props.values.backingData.filtered.images,
      ...this.getStateFromProps(props),
    };
  }

  private getStateFromProps(
    props: IServerGroupBasicSettingsProps & IWizardPageProps & FormikProps<IAmazonServerGroupCommand>,
  ) {
    const { app, values } = props;
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

  public componentDidMount() {
    const { values } = this.props;
    this.imageSearchResultsStream
      .debounceTime(250)
      .switchMap(this.searchImagesImpl)
      .subscribe(data => {
        const images = data.map((image: any) => {
          if (image.message && !image.imageName) {
            return image;
          }
          return {
            imageName: image.imageName,
            ami: image.amis && image.amis[values.region] ? image.amis[values.region][0] : null,
            virtualizationType: image.attributes ? image.attributes.virtualizationType : null,
          };
        });
        values.backingData.filtered.images = images;
        values.backingData.packageImages = values.backingData.filtered.images;
        this.setState({ images });
      });
    if (!values.amiName) {
      this.searchImages('');
    }
  }

  private searchImagesImpl = (q: string) => {
    const { values } = this.props;

    const images = [
      {
        message: `<loading-spinner size="'nano'"></loading-spinner> Finding results matching "${q}"...`,
      },
    ];
    this.setState({ images });

    return Observable.fromPromise<any[]>(
      ReactInjector.imageReader.findImages({
        provider: values.selectedProvider,
        q: q,
        region: values.region,
      }),
    ).map(result => {
      if (result.length === 0 && q.startsWith('ami-') && q.length === 12) {
        // allow 'advanced' users to continue with just an ami id (backing image may not have been indexed yet)
        const record = {
          imageName: q,
          amis: {},
          attributes: {
            virtualizationType: '*',
          },
        } as any;

        // trust that the specific image exists in the selected region
        record.amis[values.region] = [q];
        result = [record];
      }

      return result;
    });
  };

  private searchImages = (q: string) => {
    this.imageSearchResultsStream.next(q);
  };

  private enableAllImageSearch = () => {
    this.props.values.viewState.useAllImageSelection = true;
    this.searchImages('');
  };

  private imageChanged = (image: any) => {
    const { setFieldValue, values } = this.props;
    values.virtualizationType = image.virtualizationType;
    values.amiName = image.amiName;
    setFieldValue('virtualizationType', image.virtualizationType);
    setFieldValue('amiName', image.imageName);
    values.imageChanged(values);
  };

  private accountUpdated = (account: string): void => {
    const { setFieldValue, values } = this.props;
    values.credentialsChanged(values);
    values.subnetChanged(values);
    setFieldValue('credentials', account);
  };

  private regionUpdated = (region: string): void => {
    const { values, setFieldValue } = this.props;
    values.regionChanged(values);
    setFieldValue('region', region);
  };

  private subnetUpdated = (): void => {
    const { setFieldValue, values } = this.props;
    values.subnetChanged(values);
    setFieldValue('subnetType', values.subnetType);
  };

  public validate(values: IAmazonServerGroupCommand): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    if (!isStackPattern(values.stack)) {
      errors.stack = 'Only dot(.) and underscore(_) special characters are allowed in the Stack field.';
    }

    if (!isDetailPattern(values.freeFormDetails)) {
      errors.freeFormDetails =
        'Only dot(.), underscore(_), and dash(-) special characters are allowed in the Detail field.';
    }

    if (!values.amiName) {
      errors.amiName = 'Image required.';
    }

    return errors;
  }

  private clientRequestsChanged = () => {
    this.props.values.toggleSuspendedProcess(this.props.values, 'AddToLoadBalancer');
    this.setState({});
  };

  private navigateToLatestServerGroup = () => {
    const { values } = this.props;
    const { latestServerGroup } = this.state;

    const params = {
      provider: values.selectedProvider,
      accountId: latestServerGroup.account,
      region: latestServerGroup.region,
      serverGroup: latestServerGroup.name,
    };

    // TODO: Dismiss the modal

    const { $state } = ReactInjector;
    if ($state.is('home.applications.application.insight.clusters')) {
      $state.go('.serverGroup', params);
    } else {
      $state.go('^.serverGroup', params);
    }
  };

  private stackChanged = (stack: string) => {
    const { setFieldValue, values } = this.props;
    values.stack = stack; // have to do it here to make sure it's done before calling values.clusterChanged
    setFieldValue('stack', stack);
    values.clusterChanged(values);
  };

  private freeFormDetailsChanged = (freeFormDetails: string) => {
    const { setFieldValue, values } = this.props;
    values.freeFormDetails = freeFormDetails; // have to do it here to make sure it's done before calling values.clusterChanged
    setFieldValue('freeFormDetails', freeFormDetails);
    values.clusterChanged(values);
  };

  public componentWillReceiveProps(
    nextProps: IServerGroupBasicSettingsProps & IWizardPageProps & FormikProps<IAmazonServerGroupCommand>,
  ) {
    this.setState(this.getStateFromProps(nextProps));
  }

  private handleReasonChanged = (reason: string) => {
    this.props.setFieldValue('reason', reason);
  };

  public render() {
    const { app, errors, values } = this.props;
    const { createsNewCluster, images, latestServerGroup, namePreview, showPreviewAsWarning } = this.state;
    const { AccountSelectField, DeploymentStrategySelector } = NgReact;
    const { SubnetSelectField } = AwsNgReact;

    const accounts = values.backingData.accounts;
    const readOnlyFields = values.viewState.readOnlyFields || {};

    const selectedImage = values.amiName
      ? values.backingData.filtered.images.find(image => image.imageName === values.amiName)
      : undefined;
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
            <AccountSelectField
              readOnly={readOnlyFields.credentials}
              component={values}
              field="credentials"
              accounts={accounts}
              provider="aws"
              onChange={this.accountUpdated}
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
        <SubnetSelectField
          readOnly={readOnlyFields.subnet}
          labelColumns={3}
          helpKey="aws.serverGroup.subnet"
          component={values}
          field="subnetType"
          region={values.region}
          application={app}
          subnets={values.backingData.filtered.subnetPurposes}
          onChange={this.subnetUpdated}
        />
        <div className="form-group">
          <div className="col-md-3 sm-label-right">
            Stack <HelpField id="aws.serverGroup.stack" />
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
            Detail <HelpField id="aws.serverGroup.detail" />
          </div>
          <div className="col-md-7">
            <input
              type="text"
              className="form-control input-sm no-spel"
              value={values.freeFormDetails}
              onChange={e => this.freeFormDetailsChanged(e.target.value)}
            />
          </div>
        </div>
        {errors.freeFormDetails && (
          <div className="form-group row slide-in">
            <div className="col-sm-9 col-sm-offset-2 error-message">
              <span>{errors.freeFormDetails}</span>
            </div>
          </div>
        )}
        {!values.viewState.disableImageSelection && (
          <div className="form-group">
            <div className="col-md-3 sm-label-right">
              Image <HelpField id="aws.serverGroup.imageName" />
            </div>
            {values.viewState.useAllImageSelection && (
              <div className="col-md-9">
                <TetheredSelect
                  clearable={false}
                  placeholder="Search for an image..."
                  required={true}
                  valueKey="imageName"
                  options={images}
                  optionRenderer={this.imageOptionRenderer}
                  onInputChange={value => this.searchImages(value)}
                  onChange={(value: Option<string>) => this.imageChanged(value)}
                  onSelectResetsInput={false}
                  onBlurResetsInput={false}
                  onCloseResetsInput={false}
                  value={selectedImage}
                  valueRenderer={this.imageOptionRenderer}
                />
              </div>
            )}
            {!values.viewState.useAllImageSelection && (
              <div className="col-md-9">
                <TetheredSelect
                  clearable={false}
                  placeholder="Pick an image"
                  required={true}
                  valueKey="imageName"
                  options={images}
                  optionRenderer={this.imageOptionRenderer}
                  onInputChange={value => this.searchImages(value)}
                  onChange={(value: Option<string>) => this.imageChanged(value)}
                  onSelectResetsInput={false}
                  onBlurResetsInput={false}
                  onCloseResetsInput={false}
                  value={selectedImage}
                  valueRenderer={this.imageOptionRenderer}
                />
                <a className="clickable" onClick={this.enableAllImageSearch}>
                  Search All Images
                </a>{' '}
                <HelpField id="aws.serverGroup.allImages" />
              </div>
            )}
          </div>
        )}
        <div className="form-group">
          <div className="col-md-3 sm-label-right">
            Traffic <HelpField id="aws.serverGroup.traffic" />
          </div>
          <div className="col-md-9 checkbox">
            <label>
              <input
                type="checkbox"
                onChange={this.clientRequestsChanged}
                checked={!values.processIsSuspended(values, 'AddToLoadBalancer')}
                disabled={values.strategy !== '' && values.strategy !== 'custom'}
              />
              Send client requests to new instances
            </label>
          </div>
        </div>
        {!values.viewState.disableStrategySelection &&
          values.selectedProvider && (
            <DeploymentStrategySelector command={values} onStrategyChange={values.onStrategyChange} />
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
                  {!createsNewCluster &&
                    values.viewState.mode === 'create' &&
                    latestServerGroup && (
                      <div className="text-left">
                        <p>There is already a server group in this cluster. Do you want to clone it?</p>
                        <p>
                          Cloning copies the entire configuration from the selected server group, allowing you to modify
                          whichever fields (e.g. image) you need to change in the new server group.
                        </p>
                        <p>
                          To clone a server group, select "Clone" from the "Server Group Actions" menu in the details
                          view of the server group.
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

  private imageOptionRenderer = (option: Option) => {
    return (
      <>
        <span>{option.message}</span>
        <span>{option.imageName}</span>
        {option.ami && (
          <span>
            {' '}
            (<span>{option.ami}</span>)
          </span>
        )}
      </>
    );
  };
}

export const ServerGroupBasicSettings = wizardPage<IServerGroupBasicSettingsProps>(ServerGroupBasicSettingsImpl);
