import {
  AccountSelectInput,
  AccountService,
  Application,
  FormikFormField,
  HelpField,
  IAccount,
  IMoniker,
  IRegion,
  IWizardPageComponent,
  NameUtils,
  RegionSelectInput,
  Spinner,
  TextAreaInput,
  TextInput,
  FormValidator,
  FirewallLabels,
  Validators,
} from '@spinnaker/core';
import { FormikProps } from 'formik';
import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import { ITencentcloudLoadBalancer } from 'tencentcloud/domain';
import { ISecurityGroupDetail } from '../../define';

export interface ISubnetOption {
  vpcId: string;
  id: string;
  name: string;
}

export interface ILoadBalancerLocationProps {
  app: Application;
  formik: FormikProps<ISecurityGroupDetail>;
  forPipelineConfig?: boolean;
  isNew?: boolean;
  loadBalancer?: ITencentcloudLoadBalancer;
}

export interface ILoadBalancerLocationState {
  accounts: IAccount[];
  existingLoadBalancerNames: string[];
  internalFlagToggled: boolean;
  regions: IRegion[];
}

export class LoadBalancerLocation extends React.Component<ILoadBalancerLocationProps, ILoadBalancerLocationState>
  implements IWizardPageComponent<ISecurityGroupDetail> {
  public state: ILoadBalancerLocationState = {
    accounts: undefined,
    existingLoadBalancerNames: [],
    internalFlagToggled: false,
    regions: [],
  };

  private props$ = new Subject<ILoadBalancerLocationProps>();
  private destroy$ = new Subject<void>();

  public validate(values: ISecurityGroupDetail) {
    const { credentials, region } = values;
    const validator = new FormValidator(values);

    validator
      .field('name')
      .withValidators(
        Validators.valueUnique(
          this.state.existingLoadBalancerNames,
          `There is already a ${FirewallLabels.get('firewall')} in ${credentials}:${region} with that name.`,
        ),
        Validators.maxLength(32, `${FirewallLabels.get('Firewall')} names cannot exceed 32 characters in length`),
      );

    validator
      .field('stack')
      .optional()
      .withValidators(value => !value.match(/^[a-zA-Z0-9]*$/) && 'Stack can only contain letters and numbers.');

    validator
      .field('detail')
      .optional()
      .withValidators(
        value => !value.match(/^[a-zA-Z0-9-]*$/) && 'Detail can only contain letters, numbers, and dashes.',
      );

    return validator.validateForm();
  }

  public componentDidMount(): void {
    const formValues$ = this.props$.map(props => props.formik.values);
    const appName$ = this.props$.map(props => props.app.name).distinctUntilChanged();

    const form = {
      account$: formValues$.map(x => x.credentials).distinctUntilChanged(),
      region$: formValues$.map(x => x.region).distinctUntilChanged(),
      stack$: formValues$.map(x => x.stack).distinctUntilChanged(),
      detail$: formValues$.map(x => x.detail).distinctUntilChanged(),
      description$: formValues$.map(x => x.description).distinctUntilChanged(),
    };

    const allAccounts$ = Observable.fromPromise(AccountService.listAccounts('tencentcloud')).shareReplay(1);

    // combineLatest with allAccounts to wait for accounts to load and be cached
    const accountRegions$ = Observable.combineLatest(form.account$, allAccounts$)
      .switchMap(([currentAccount, _allAccounts]) => AccountService.getRegionsForAccount(currentAccount))
      .shareReplay(1);

    const allLoadBalancers$ = this.props.app.getDataSource('loadBalancers').data$ as Observable<
      ITencentcloudLoadBalancer[]
    >;
    const regionLoadBalancers$ = Observable.combineLatest(allLoadBalancers$, form.account$, form.region$)
      .map(([allLoadBalancers, currentAccount, currentRegion]) => {
        return allLoadBalancers
          .filter(lb => lb.account === currentAccount && lb.region === currentRegion)
          .map(lb => lb.name);
      })
      .shareReplay(1);

    const moniker$ = Observable.combineLatest(appName$, form.stack$, form.detail$).map(([app, stack, detail]) => {
      return { app, stack, detail, cluster: NameUtils.getClusterName(app, stack, detail) } as IMoniker;
    });

    accountRegions$
      .withLatestFrom(form.region$)
      .takeUntil(this.destroy$)
      .subscribe(([accountRegions, selectedRegion]) => {
        // If the selected region doesn't exist in the new list of regions (for a new acct), select the first region.
        if (!accountRegions.some(x => x.name === selectedRegion)) {
          this.props.formik.setFieldValue('region', accountRegions[0] && accountRegions[0].name);
        }
      });
    moniker$.takeUntil(this.destroy$).subscribe(moniker => {
      this.props.formik.setFieldValue('moniker', moniker);
      this.props.formik.setFieldValue('name', moniker.cluster);
    });

    Observable.combineLatest(allAccounts$, accountRegions$, regionLoadBalancers$)
      .takeUntil(this.destroy$)
      .subscribe(([accounts, regions, existingLoadBalancerNames]) => {
        return this.setState({ accounts, regions, existingLoadBalancerNames });
      });
  }

  public componentDidUpdate() {
    this.props$.next(this.props);
  }

  public componentWillUnmount(): void {
    this.destroy$.next();
  }

  public render() {
    const { values } = this.props.formik;
    const { accounts, regions } = this.state;

    return (
      <div className="container-fluid form-horizontal">
        {!accounts && (
          <div style={{ height: '200px' }}>
            <Spinner size="medium" />
          </div>
        )}
        {accounts && (
          <div>
            <div className="well alert-info">
              <FormikFormField
                name="name"
                touched={true}
                input={() => (
                  <>
                    <span>
                      <strong>Your load balancer will be named: </strong>
                      {values.name}
                      <HelpField id="tencentcloud.loadBalancer.name" />
                    </span>
                  </>
                )}
              />
            </div>

            <FormikFormField
              name="credentials"
              label="Account"
              input={props => <AccountSelectInput {...props} accounts={accounts} provider="tencentcloud" />}
            />

            <FormikFormField
              name="region"
              label="Region"
              input={props => <RegionSelectInput {...props} account={values.credentials} regions={regions} />}
            />

            <FormikFormField name="stack" label="Stack" touched={true} input={props => <TextInput {...props} />} />
            <FormikFormField name="detail" label="Detail" touched={true} input={props => <TextInput {...props} />} />
            <FormikFormField name="description" label="Description" input={props => <TextAreaInput {...props} />} />
          </div>
        )}
      </div>
    );
  }
}
