import {
  AccountSelectInput,
  AccountService,
  Application,
  HelpField,
  IAccount,
  IMoniker,
  IRegion,
  IWizardPageComponent,
  NameUtils,
  RegionSelectField,
  Spinner,
  ValidationMessage,
} from '@spinnaker/core';
import * as classNames from 'classnames';
import { Field, FormikErrors, FormikProps } from 'formik';
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
    const errors = {} as FormikErrors<ISecurityGroupDetail>;

    if (this.state.existingLoadBalancerNames.includes(values.name)) {
      errors.name = `There is already a load balancer in ${values.credentials}:${values.region} with that name.`;
    }

    if (values.name && values.name.length > 32) {
      errors.name = 'Load balancer names cannot exceed 32 characters in length';
    }

    if (values.stack && !values.stack.match(/^[a-zA-Z0-9]*$/)) {
      errors.stack = 'Stack can only contain letters and numbers.';
    }

    if (values.detail && !values.detail.match(/^[a-zA-Z0-9-]*$/)) {
      errors.detail = 'Detail can only contain letters, numbers, and dashes.';
    }

    return errors;
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

  private accountUpdated = (account: string): void => {
    this.props.formik.setFieldValue('credentials', account);
  };

  private regionUpdated = (region: string): void => {
    this.props.formik.setFieldValue('region', region);
  };

  private stackChanged = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.formik.setFieldValue('stack', event.target.value);
  };

  private detailChanged = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.formik.setFieldValue('detail', event.target.value);
  };
  private descriptionChanged = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.formik.setFieldValue('description', event.target.value);
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
      <div className="container-fluid form-horizontal">
        {!accounts && (
          <div style={{ height: '200px' }}>
            <Spinner size="medium" />
          </div>
        )}
        {accounts && (
          <div className="modal-body">
            <div className="form-group">
              <div className={className}>
                <strong>Your load balancer will be named: </strong>
                <span>{values.name}</span>
                <HelpField id="tencentcloud.loadBalancer.name" />
                <Field type="text" style={{ display: 'none' }} className="form-control input-sm no-spel" name="name" />
                {errors.name && <ValidationMessage type="error" message={errors.name} />}
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-3 sm-label-right">Account</div>
              <div className="col-md-8">
                <AccountSelectInput
                  value={values.credentials}
                  onChange={(evt: any) => this.accountUpdated(evt.target.value)}
                  accounts={accounts}
                  provider="tencentcloud"
                />
              </div>
            </div>
            <RegionSelectField
              labelColumns={3}
              component={values}
              field="region"
              account={values.credentials}
              onChange={this.regionUpdated}
              regions={regions}
            />
            <div className="form-group">
              <div className="col-md-3 sm-label-right">Stack</div>
              <div className="col-md-3">
                <input
                  type="text"
                  className={`form-control nput-sm no-spel ${errors.stack ? 'invalid' : ''}`}
                  value={values.stack}
                  name="stack"
                  onChange={this.stackChanged}
                />
              </div>
              <div className="col-md-2 sm-label-right">Detail</div>
              <div className="col-md-3">
                <input
                  type="text"
                  className={`form-control input-sm no-spel ${errors.detail ? 'invalid' : ''}`}
                  value={values.detail}
                  name="detail"
                  onChange={this.detailChanged}
                />
              </div>
              {errors.stack && (
                <div className="col-md-7 col-md-offset-3">
                  <ValidationMessage type="error" message={errors.stack} />
                </div>
              )}
              {errors.detail && (
                <div className="col-md-7 col-md-offset-3">
                  <ValidationMessage type="error" message={errors.detail} />
                </div>
              )}
            </div>
            <div className="form-group">
              <div className="col-md-3 sm-label-right">Description (required)</div>
              <div className="col-md-8">
                {
                  <textarea
                    required={true}
                    className={`form-control input-sm no-spel`}
                    value={values.description}
                    name="description"
                    // @ts-ignore
                    onChange={this.descriptionChanged}
                  />
                }
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
