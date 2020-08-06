import React from 'react';
import classNames from 'classnames';
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
  Application,
  FormValidator,
} from '@spinnaker/core';

import { FormikProps, FormikErrors } from 'formik';
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { IAmazonFunction } from 'amazon/domain';
import { Subject, Observable } from 'rxjs';
import { s3BucketNameValidator } from 'amazon/aws.validators';

const availableRuntimes = [
  'nodejs10.x',
  'nodejs12.x',
  'java8',
  'java11',
  'python2.7',
  'python3.6',
  'python3.7',
  'python3.8',
  'dotnetcore2.1',
  'dotnetcore3.1',
  'go1.x',
  'ruby2.5',
  'ruby2.7',
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

  private props$ = new Subject<IFunctionProps>();
  private destroy$ = new Subject<void>();

  public validate(values: IAmazonFunctionUpsertCommand): FormikErrors<IAmazonFunctionUpsertCommand> {
    const validator = new FormValidator(values);
    validator
      .field('s3bucket', 'S3 Bucket Name')
      .optional()
      .withValidators(s3BucketNameValidator);
    const errors = validator.validateForm();

    if (
      this.props.isNew &&
      this.state.existingFunctionNames.includes(this.props.app.name.concat('-').concat(values.functionName))
    ) {
      errors.functionName = `There is already a function in ${values.credentials}:${values.region} with that name.`;
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

  public render() {
    const { isNew } = this.props;
    const { errors, values } = this.props.formik;
    const { accounts, regions } = this.state;
    const className = classNames({
      well: true,
      'alert-danger': !!errors.functionName,
      'alert-info': !errors.functionName,
    });
    return (
      <div className="container-fluid form-horizontal ">
        {isNew && (
          <div className={className}>
            <strong>Your function will be named: </strong>
            <HelpField id="aws.function.name" />
            <span>
              {this.props.app.name}-{values.functionName}
            </span>
            <FormikFormField name="functionName" input={() => null} />
          </div>
        )}
        <FormikFormField
          name="credentials"
          label="Account"
          input={props => (
            <ReactSelectInput {...props} stringOptions={accounts.map((acc: IAccount) => acc.name)} clearable={true} />
          )}
        />
        <FormikFormField
          name="region"
          label="Region"
          input={props => (
            <ReactSelectInput {...props} stringOptions={regions.map((reg: IRegion) => reg.name)} clearable={true} />
          )}
        />
        <FormikFormField
          name="functionName"
          label="Function Name"
          help={<HelpField id="aws.function.name" />}
          input={props => <TextInput {...props} />}
        />
        <FormikFormField
          name="runtime"
          label="Runtime"
          help={<HelpField id="aws.function.runtime" />}
          input={props => <ReactSelectInput {...props} stringOptions={availableRuntimes} clearable={true} />}
        />
        <FormikFormField
          name="s3bucket"
          label="S3 Bucket"
          help={<HelpField id="aws.function.s3bucket" />}
          input={props => <TextInput {...props} placeholder="S3 bucket name" />}
        />
        <FormikFormField
          name="s3key"
          label="S3 Key"
          help={<HelpField id="aws.function.s3key" />}
          input={props => <TextInput {...props} placeholder="object.zip" />}
        />
        <FormikFormField
          name="handler"
          label="Handler"
          help={<HelpField id="aws.function.handler" />}
          input={props => <TextInput {...props} placeholder="filename.method" />}
        />
        <FormikFormField name="publish" label="Publish" input={props => <CheckboxInput {...props} />} />
      </div>
    );
  }
}
