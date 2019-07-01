import * as React from 'react';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD

import {
  Application,
  FormikFormField,
=======

=======
import * as classNames from 'classnames';
>>>>>>> 55f391bce... adding change for prefixing function name  with application name, and change for KMS key  field name
import {
  FormikFormField,
  CheckboxInput,
  AccountService,
  IAccount,
<<<<<<< HEAD
>>>>>>> de34eb8e8... minor fix
=======
  IRegion,
>>>>>>> 741c6375a... Fixing region selection drop down
  IWizardPageComponent,
  HelpField,
  TextInput,
  ReactSelectInput,
  RegionSelectField,
  Application,
  ValidationMessage,
} from '@spinnaker/core';
<<<<<<< HEAD
<<<<<<< HEAD
import { FormikProps, Field, FormikErrors } from 'formik';
=======

import { FormikProps, FormikErrors } from 'formik';
>>>>>>> f86a932a7... Edit and delete functions
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { IAmazonFunction } from 'amazon/domain';
import { Subject, Observable } from 'rxjs';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import * as classNames from 'classnames';
=======
import { Observable, Subject } from 'rxjs';
import { FormikFormField, AccountService, IAccount, IWizardPageComponent, HelpField, TextInput, ReactSelectInput } from '@spinnaker/core';
=======
>>>>>>> de34eb8e8... minor fix
import { FormikProps, Field } from 'formik';
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { IAmazonFunction } from 'amazon/domain';
=======
import { ISubnetOption } from 'amazon/loadBalancer/configure/common/LoadBalancerLocation';
>>>>>>> 16125cf09... Fix for displaying vpc config in create/edit function modal.

>>>>>>> 5ae02b7cf... Added account dropdown
=======
=======
import { ISubnetOption } from 'amazon/loadBalancer/configure/common/LoadBalancerLocation';
>>>>>>> f1ef75e77... Fix for displaying vpc config in create/edit function modal.
=======
>>>>>>> d088fd1bf... Fix linting issues

>>>>>>> f86a932a7... Edit and delete functions
const availableRuntimes = [
  'nodejs',
  'nodejs4.3',
  'nodejs6.10',
  'nodejs8.10',
  'nodejs10.x',
  'java8',
  'python2.7',
  'python3.6',
  'python3.7',
  'dotnetcore1.0',
  'dotnetcore2.0',
  'dotnetcore2.1',
  'nodejs4.3-edge',
  'go1.x',
  'ruby2.5',
  'provided',
];

export interface IFunctionProps {
  app: Application;
  formik: FormikProps<IAmazonFunctionUpsertCommand>;
  isNew?: boolean;
  functionDef: IAmazonFunction;
}

export interface IFunctionState {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  existingFunctionNames: IFunctionByAccount[];
=======
  availableRuntimes: Array<{ label: string; value: string }>;
  accounts: IAccount[];
  defaultRuntime: string[];
>>>>>>> 5ae02b7cf... Added account dropdown
=======
  //existingFunctionNames: IFunctionByAccount[];
=======
  existingFunctionNames: string[];
>>>>>>> f86a932a7... Edit and delete functions
  accounts: IAccount[];
  regions: IRegion[];
>>>>>>> 741c6375a... Fixing region selection drop down
}

export class FunctionBasicInformation extends React.Component<IFunctionProps, IFunctionState>
  implements IWizardPageComponent<IAmazonFunctionUpsertCommand> {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  constructor(props: IFunctionProps) {
    super(props);
    //const fnNames = FunctionReader.listFunctions('aws');
    this.state = {
      existingFunctionNames: [],
    };
=======
  public state: IFunctionState = {
    accounts: [],
    existingFunctionNames: [],
    regions: [],
  };

  constructor(props: IFunctionProps) {
    super(props);

    AccountService.listAccounts('aws').then(accounts => {
      this.state = {
        accounts,
        regions: [],
        existingFunctionNames: [],
      };
    });
>>>>>>> 741c6375a... Fixing region selection drop down
  }

  private props$ = new Subject<IFunctionProps>();
  private destroy$ = new Subject<void>();

  public validate(values: IAmazonFunctionUpsertCommand): FormikErrors<IAmazonFunctionUpsertCommand> {
    const errors = {} as any;

    if (this.props.isNew && this.state.existingFunctionNames.includes(values.functionName)) {
      errors.name = `There is already a function in ${values.credentials}:${values.region} with that name.`;
    }

    if (values.s3bucket && !values.s3bucket.match(/^[0-9A-Za-z\.\-_]*(?<!\.)$/)) {
      errors.stack = 'Invalid S3 Bucket name.';
    }

    return errors;
  }

  public componentDidUpdate() {
    this.props$.next(this.props);
  }

  public componentWillUnmount(): void {
    this.destroy$.next();
  }

  public componentDidMount(): void {
    const formValues$ = this.props$.map(props => props.formik.values);

    const form = {
      account$: formValues$.map(x => x.credentials).distinctUntilChanged(),
      region$: formValues$.map(x => x.region).distinctUntilChanged(),
      functionName$: formValues$.map(x => x.functionName).distinctUntilChanged(),
      runtime$: formValues$.map(x => x.runtime).distinctUntilChanged(),
      s3bucket$: formValues$.map(x => x.s3bucket).distinctUntilChanged(),
      s3key$: formValues$.map(x => x.s3key).distinctUntilChanged(),
      handler$: formValues$.map(x => x.handler).distinctUntilChanged(),
    };

    const allAccounts$ = Observable.fromPromise(AccountService.listAccounts('aws')).shareReplay(1);

    // combineLatest with allAccounts to wait for accounts to load and be cached
    const accountRegions$ = Observable.combineLatest(form.account$, allAccounts$)
      .switchMap(([currentAccount, _allAccounts]) => AccountService.getRegionsForAccount(currentAccount))
      .shareReplay(1);

    const allFunctions$ = this.props.app.getDataSource('functions').data$ as Observable<IAmazonFunction[]>;
    const regionfunctions$ = Observable.combineLatest(allFunctions$, form.account$, form.region$)
      .map(([allFunctions, currentAccount, currentRegion]) => {
        return allFunctions
          .filter(fn => fn.account === currentAccount && fn.region === currentRegion)
          .map(fn => fn.functionName);
      })
      .shareReplay(1);

    accountRegions$
      .withLatestFrom(form.region$)
      .takeUntil(this.destroy$)
      .subscribe(([accountRegions, selectedRegion]) => {
        // If the selected region doesn't exist in the new list of regions (for a new acct), select the first region.
        if (!accountRegions.some(x => x.name === selectedRegion)) {
          this.props.formik.setFieldValue('region', accountRegions[0] && accountRegions[0].name);
        }
      });

    Observable.combineLatest(allAccounts$, accountRegions$, regionfunctions$)
      .takeUntil(this.destroy$)
      .subscribe(([accounts, regions, existingFunctionNames]) => {
        return this.setState({ accounts, regions, existingFunctionNames });
      });
  }

  private handleRegionChange = (value: string): void => {
    this.props.formik.setFieldValue('region', value);
<<<<<<< HEAD
    console.log('region changed: ', value);
  };

  private handleRuntimeChange = (value: string): void => {
    this.props.formik.setFieldValue('runtime', value);
    console.log('runtime changed: ', value);
  };

  private handleS3BucketChange = (value: string): void => {
    this.props.formik.setFieldValue('s3bucket', value);
    console.log('s3 bucket changed: ', value);
  };

  private handleS3FunctionFileChange = (value: string): void => {
    this.props.formik.setFieldValue('s3key', value);
    console.log('s3 key changed: ', value);
  };

  private handleHandlerChange = (value: string): void => {
    this.props.formik.setFieldValue('handler', value);
    console.log('handler changed: ', value);
  };

<<<<<<< HEAD
=======
  private handleAccountChange = (value: string): void => {
    this.props.formik.setFieldValue('credentials', value);
    console.log('Account changed: ', value);
=======
>>>>>>> f86a932a7... Edit and delete functions
  };

>>>>>>> 5884dda55... Fixed merge issues
  public render() {
    const { errors, values } = this.props.formik;
<<<<<<< HEAD

    const className = classNames({
      'col-md-12': true,
      well: true,
      'alert-danger': errors.name,
      'alert-info': !errors.name,
    });

=======
    constructor(props: IFunctionProps) {
      super(props);
      AccountService.listAccounts('aws').then((acc: IAccount) => {
        this.state.accounts = acc
      })
    }
    public state: IFunctionState = {
      accounts: [],
      availableRuntimes: null,
      defaultRuntime: []
    };

    public render() {
      const { accounts } = this.state
>>>>>>> 5ae02b7cf... Added account dropdown
=======
  constructor(props: IFunctionProps) {
    super(props);
    AccountService.listAccounts('aws').then((acc: IAccount) => {
      this.state.accounts = acc;
    });
  }
  public state: IFunctionState = {
    accounts: [],
    availableRuntimes: null,
    defaultRuntime: [],
  };
=======
    const { accounts, regions } = this.state;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 741c6375a... Fixing region selection drop down

  public render() {
    const { accounts } = this.state;
>>>>>>> de34eb8e8... minor fix
    return (
      <div className="container-fluid form-horizontal">
        <div className="modal-body">
          <div className="form-group">
<<<<<<< HEAD
            <div className="scol-md-3 sm-label-left">
              Function Name
              <HelpField id="aws.function.name" />
              <TextInput
                type="text"
                className={`form-control input-sm no-spel ${errors.functionName ? 'invalid' : ''}`}
                name="name"
                value={values.functionName}
                onChange={(evt: any) => this.handleFunctionNameChange(evt.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="scol-md-3 sm-label-left">
              Region
              <HelpField id="aws.function.region" />
              <TextInput
                type="text"
                className="form-control"
                name="region"
                value={values.region}
                onChange={(evt: any) => this.handleRegionChange(evt.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="scol-md-3 sm-label-left">
              Runtime
              <HelpField id="aws.function.runtime" />
              <ReactSelectInput
                inputClassName="aws-react-select"
                stringOptions={availableRuntimes}
                clearable={false}
                value={values.runtime}
                onChange={(evt: any) => this.handleRuntimeChange(evt.target.value)}
              />
            </div>
          </div>
<<<<<<< HEAD

          <div className="form-group">
            <div className="scol-md-3 sm-label-left">
              S3 Bucket
              <HelpField id="aws.function.region" />
              <TextInput
                type="text"
                className="form-control"
                name="s3Bucket"
                value={values.s3bucket}
                onChange={(evt: any) => this.handleS3BucketChange(evt.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="scol-md-3 sm-label-left">
              S3 Function File
              <HelpField id="aws.function.region" />
              <TextInput
                type="text"
                className="form-control"
                name="s3FunctionFile"
                value={values.s3key}
                onChange={(evt: any) => this.handleS3FunctionFileChange(evt.target.value)}
              />
            </div>
=======
          <div className="sp-margin-m-bottom">
            <FormikFormField
              name="account"
              label="Account"
              help={<HelpField id="aws.function.name" />}
=======
            <div className="sp-margin-m-bottom">
              <div className="form-group">
                <div className="scol-md-3 sm-label-left">
                  Account
                  <HelpField id="aws.function.name" />
                  <ReactSelectInput
                    inputClassName="cloudfoundry-react-select"
                    stringOptions={accounts.map((acc: IAccount) => acc.name)}
                    clearable={true}
                    value={values.credentials}
                    onChange={(evt: any) => this.handleAccountChange(evt.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="scol-md-3 sm-label-left">
                  Function Name
                  <HelpField id="aws.function.name" />
                  <TextInput
                    type="text"
                    className={`form-control input-sm no-spel ${errors.functionName ? 'invalid' : ''}`}
                    name="name"
                    placeholder={app.name.concat('-')}
                    value={values.functionName}
                    onChange={(evt: any) => this.handleFunctionNameChange(evt.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="scol-md-3 sm-label-left">
                  {/* Region
                  <HelpField id="aws.function.region" />
                  <TextInput
                    type="text"
                    className="form-control"
                    name="region"
                    value={values.region}
                    onChange={(evt: any) => this.handleRegionChange(evt.target.value)}
                  /> */}
                  <RegionSelectField
                    labelColumns={3}
                    component={values}
                    field="region"
                    account={values.credentials}
                    onChange={this.handleRegionChange}
                    regions={regions}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="scol-md-3 sm-label-left">
                  Runtime
                  <HelpField id="aws.function.runtime" />
                  <ReactSelectInput
                    inputClassName="aws-react-select"
                    stringOptions={availableRuntimes}
                    clearable={false}
                    value={values.runtime}
                    onChange={(evt: any) => this.handleRuntimeChange(evt.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="scol-md-3 sm-label-left">
                  S3 Bucket
                  <HelpField id="aws.function.region" />
                  <TextInput
                    type="text"
                    className="form-control"
                    name="s3Bucket"
                    value={values.s3bucket}
                    onChange={(evt: any) => this.handleS3BucketChange(evt.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="scol-md-3 sm-label-left">
                  S3 Function File
                  <HelpField id="aws.function.region" />
                  <TextInput
                    type="text"
                    className="form-control"
                    name="s3FunctionFile"
                    value={values.s3key}
                    onChange={(evt: any) => this.handleS3FunctionFileChange(evt.target.value)}
                  />
                </div>
              </div>
=======
=======
    console.log('VALUES: ', values);
>>>>>>> f1ef75e77... Fix for displaying vpc config in create/edit function modal.
=======
    console.log('VALUES: ', values);
>>>>>>> 16125cf09... Fix for displaying vpc config in create/edit function modal.
=======
    // console.log('VALUES: ', values);
>>>>>>> 6e6e3db9d... Added a fix that filters subnet selections so they only show up once.
=======
>>>>>>> 8677f6ee5... 1. Fix for displaying account name on Modal 2. Changes for adding attribute for target type lambda in Target group
=======
    const className = classNames({
      'col-md-12': true,
      well: true,
      'alert-danger': errors.name,
      'alert-info': !errors.name,
    });
>>>>>>> 55f391bce... adding change for prefixing function name  with application name, and change for KMS key  field name
    return (
      <div className="container-fluid form-horizontal ">
        <div className="form-group">
          {this.props.isNew && (
            <div className={className}>
              <strong>Your function will be named: </strong>
              <span>
                {this.props.app.name}-{values.functionName}
              </span>
              {errors.name && <ValidationMessage type="error" message={errors.name} />}
            </div>
          )}
        </div>
        <div className="form-group">
          <div className="sp-margin-m-bottom">
            <FormikFormField
              fastField={false}
              name="credentials"
              label="Account"
              input={props => (
                <ReactSelectInput
                  {...props}
                  inputClassName="cloudfoundry-react-select"
                  value={values.credentials}
                  stringOptions={accounts.map((acc: IAccount) => acc.name)}
                  clearable={true}
                />
              )}
            />
          </div>
        </div>
<<<<<<< HEAD
>>>>>>> f86a932a7... Edit and delete functions

=======
>>>>>>> 8677f6ee5... 1. Fix for displaying account name on Modal 2. Changes for adding attribute for target type lambda in Target group
        <div className="sp-margin-m-bottom">
          <RegionSelectField
            labelColumns={3}
            component={values}
            field="region"
            account={values.credentials}
            onChange={this.handleRegionChange}
            regions={regions}
          />
        </div>

        <div className="sp-margin-m-bottom">
          <FormikFormField
            name="functionName"
            label="Function Name"
            help={<HelpField id="aws.function.name" />}
            input={props => <TextInput {...props} />}
          />
        </div>
        {errors.name && <ValidationMessage type="error" message={errors.name} />}
        <div className="sp-margin-m-bottom">
          <FormikFormField
            name="runtime"
            label="Runtime"
            help={<HelpField id="aws.function.runtime" />}
            input={props => (
              <ReactSelectInput
                {...props}
                inputClassName="cloudfoundry-react-select"
                stringOptions={availableRuntimes}
                clearable={true}
              />
<<<<<<< HEAD
            </div>)}
          
          <div className="sp-margin-m-bottom">
            <FormikFormField
              name="Runtime"
              label="Runtime"
              help={<HelpField id="aws.function.runtime" />}
              fastField={false}
>>>>>>> 5884dda55... Fixed merge issues
              input={props => (
                <ReactSelectInput
                  inputClassName="cloudfoundry-react-select"
                  {...props}
<<<<<<< HEAD
                  stringOptions={accounts.map((acc: IAccount) => acc.name)}
                  clearable={true}
                />
              )}
              // onChange={this.accountChanged}
              required={true}
            />
          </div>
          {accounts && (
            <div className="sp-margin-m-bottom">
=======
                  stringOptions={availableRuntimes}
                  clearable={false}
                />
              )}
              onChange={(evt: any) => this.handleRuntimeChange(evt.target.value)}
              required={true}
            />
          </div>
=======
            )}
          />
        </div>
>>>>>>> f86a932a7... Edit and delete functions

        <div className="sp-margin-m-bottom">
          <FormikFormField
            name="s3bucket"
            label="S3 Bucket"
            help={<HelpField id="aws.function.s3bucket" />}
            input={props => <TextInput {...props} placeholder="S3 bucket name" />}
          />
        </div>

        <div className="sp-margin-m-bottom">
          <FormikFormField
            name="s3key"
            label="S3 Key"
            help={<HelpField id="aws.function.s3key" />}
            input={props => <TextInput {...props} placeholder="object.zip" />}
          />
        </div>

<<<<<<< HEAD
          <div className="sp-margin-m-bottom">
>>>>>>> 5884dda55... Fixed merge issues
              <FormikFormField
                name="Region"
                label="Region"
                help={<HelpField id="aws.function.region" />}
                input={props => (
<<<<<<< HEAD
                  <TextInput {...props} type="text" className="form-control input-sm no-spel" name="name" />
=======
                  <TextInput {...props} 
                    type="text" 
                    className="form-control input-sm no-spel" 
                    name="handler" 
                    value={values.handler}
                  />
>>>>>>> 5884dda55... Fixed merge issues
                )}
              />
            </div>
          )}
          <div className="sp-margin-m-bottom">
            <FormikFormField
              name="Runtime"
              label="Runtime"
              help={<HelpField id="aws.function.runtime" />}
              fastField={false}
              input={props => (
                <ReactSelectInput
                  inputClassName="cloudfoundry-react-select"
                  {...props}
                  stringOptions={availableRuntimes}
                  clearable={false}
                />
              )}
              // onChange={this.accountChanged}
              required={true}
            />
>>>>>>> 5ae02b7cf... Added account dropdown
          </div>

          <div className="form-group">
            <div className="scol-md-3 sm-label-left">
              Lambda Handler
              <HelpField id="aws.function.region" />
              <TextInput
                type="text"
                className="form-control"
                name="handler"
                value={values.handler}
                onChange={(evt: any) => this.handleHandlerChange(evt.target.value)}
=======
        <div className="sp-margin-m-bottom">
          <FormikFormField
            name="handler"
            label="Handler"
            help={<HelpField id="aws.function.handler" />}
            input={props => <TextInput {...props} placeholder="filename.method" />}
          />
        </div>

        <div className="sp-margin-m-bottom">
          <FormikFormField
            name="publish"
            label="Publish"
            input={props => (
              <CheckboxInput
                {...props}
                value={values.publish}
                onChange={() => this.props.formik.setFieldValue('publish', !values.publish)}
>>>>>>> f86a932a7... Edit and delete functions
              />
            )}
          />
        </div>
      </div>
    );
  }
}
