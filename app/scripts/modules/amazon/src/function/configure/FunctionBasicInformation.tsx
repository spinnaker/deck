import * as React from 'react';
import * as classNames from 'classnames';
import {
  FormikFormField,
  CheckboxInput,
  AccountService,
  IAccount,
  IRegion,
  IWizardPageComponent,
  HelpField,
  TextInput,
  ReactSelectInput,
  RegionSelectField,
  Application,
  ValidationMessage,
} from '@spinnaker/core';

import { FormikProps, FormikErrors } from 'formik';
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { IAmazonFunction } from 'amazon/domain';
import { Subject, Observable } from 'rxjs';

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
  existingFunctionNames: string[];
  accounts: IAccount[];
  regions: IRegion[];
}

export class FunctionBasicInformation extends React.Component<IFunctionProps, IFunctionState>
  implements IWizardPageComponent<IAmazonFunctionUpsertCommand> {
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
  };

  public render() {
    const { errors, values } = this.props.formik;
    const { accounts, regions } = this.state;
    const className = classNames({
      'col-md-12': true,
      well: true,
      'alert-danger': errors.name,
      'alert-info': !errors.name,
    });
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
            )}
          />
        </div>

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
              />
            )}
          />
        </div>
      </div>
    );
  }
}
