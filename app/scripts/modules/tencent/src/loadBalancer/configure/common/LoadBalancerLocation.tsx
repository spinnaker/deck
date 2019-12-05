import * as React from 'react';
import * as classNames from 'classnames';
import { IPromise } from 'angular';
import { chain, isNil } from 'lodash';
import { Field, FormikErrors, FieldProps, FormikProps } from 'formik';
import { Observable, Subject } from 'rxjs';

import {
  AccountSelectInput,
  AccountService,
  Application,
  HelpField,
  IAccount,
  IMoniker,
  IRegion,
  ISubnet,
  IWizardPageComponent,
  NameUtils,
  RegionSelectField,
  Spinner,
  SubnetReader,
  ValidationMessage,
} from '@spinnaker/core';

import { TencentProviderSettings } from 'tencent/tencent.settings';
import { ITencentLoadBalancer, ITencentLoadBalancerUpsertCommand } from 'tencent/domain';
import { SubnetSelectField } from 'tencent/subnet';

export interface ISubnetOption {
  vpcId: string;
  id: string;
  name: string;
}

export interface ILoadBalancerLocationProps {
  app: Application;
  formik: FormikProps<ITencentLoadBalancerUpsertCommand>;
  forPipelineConfig?: boolean;
  isNew?: boolean;
  loadBalancer?: ITencentLoadBalancer;
}

export interface ILoadBalancerLocationState {
  accounts: IAccount[];
  existingLoadBalancerNames: string[];
  hideInternalFlag: boolean;
  internalFlagToggled: boolean;
  regions: IRegion[];
  subnets: ISubnetOption[];
}

export class LoadBalancerLocation extends React.Component<ILoadBalancerLocationProps, ILoadBalancerLocationState>
  implements IWizardPageComponent<ITencentLoadBalancerUpsertCommand> {
  public state: ILoadBalancerLocationState = {
    accounts: undefined,
    existingLoadBalancerNames: [],
    hideInternalFlag: false,
    internalFlagToggled: false,
    regions: [],
    subnets: [],
  };

  private props$ = new Subject<ILoadBalancerLocationProps>();
  private destroy$ = new Subject<void>();

  public validate(values: ITencentLoadBalancerUpsertCommand) {
    const errors = {} as FormikErrors<ITencentLoadBalancerUpsertCommand>;

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

  protected buildName(): void {
    const { values } = this.props.formik;
    if (isNil(values.moniker)) {
      const nameParts = NameUtils.parseLoadBalancerName(values.name);
      values.stack = nameParts.stack;
      values.detail = nameParts.freeFormDetails;
    } else {
      values.stack = values.moniker.stack;
      values.detail = values.moniker.detail;
    }
    delete values.name;
  }

  private shouldHideInternalFlag(): boolean {
    if (TencentProviderSettings) {
      if (TencentProviderSettings.loadBalancers && TencentProviderSettings.loadBalancers.inferInternalFlagFromSubnet) {
        // clouddriver will check the subnet if isInternal is competely omitted
        delete this.props.formik.values.isInternal;
        return true;
      }
    }
    return false;
  }

  public componentDidMount(): void {
    this.setState({ hideInternalFlag: this.shouldHideInternalFlag() });
    if (this.props.loadBalancer && this.props.isNew) {
      this.buildName();
    }

    const formValues$ = this.props$.map(props => props.formik.values);
    const appName$ = this.props$.map(props => props.app.name).distinctUntilChanged();

    const form = {
      account$: formValues$.map(x => x.credentials).distinctUntilChanged(),
      region$: formValues$.map(x => x.region).distinctUntilChanged(),
      subnetPurpose$: formValues$.map(x => x.subnetType).distinctUntilChanged(),
      stack$: formValues$.map(x => x.stack).distinctUntilChanged(),
      detail$: formValues$.map(x => x.detail).distinctUntilChanged(),
    };

    const allAccounts$ = Observable.fromPromise(AccountService.listAccounts('tencent')).shareReplay(1);

    // combineLatest with allAccounts to wait for accounts to load and be cached
    const accountRegions$ = Observable.combineLatest(form.account$, allAccounts$)
      .switchMap(([currentAccount, _allAccounts]) => AccountService.getRegionsForAccount(currentAccount))
      .shareReplay(1);

    const allLoadBalancers$ = this.props.app.getDataSource('loadBalancers').data$ as Observable<ITencentLoadBalancer[]>;
    const regionLoadBalancers$ = Observable.combineLatest(allLoadBalancers$, form.account$, form.region$)
      .map(([allLoadBalancers, currentAccount, currentRegion]) => {
        return allLoadBalancers
          .filter(lb => lb.account === currentAccount && lb.region === currentRegion)
          .map(lb => lb.name);
      })
      .shareReplay(1);

    const regionSubnets$ = Observable.combineLatest(form.account$, form.region$)
      .switchMap(([currentAccount, currentRegion]) => this.getAvailableSubnets(currentAccount, currentRegion))
      .map(availableSubnets => this.makeSubnetOptions(availableSubnets))
      .shareReplay(1);

    const subnet$ = Observable.combineLatest(regionSubnets$, form.subnetPurpose$).map(
      ([allSubnets, subnetPurpose]) => allSubnets && allSubnets.find(subnet => subnet.id === subnetPurpose),
    );

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

    subnet$.takeUntil(this.destroy$).subscribe(subnet => {
      this.props.formik.setFieldValue('vpcId', subnet && subnet.vpcId);
      this.props.formik.setFieldValue('subnetType', subnet && subnet.id);
    });

    moniker$.takeUntil(this.destroy$).subscribe(moniker => {
      this.props.formik.setFieldValue('moniker', moniker);
      this.props.formik.setFieldValue('name', moniker.cluster);
    });

    Observable.combineLatest(allAccounts$, accountRegions$, regionLoadBalancers$, regionSubnets$)
      .takeUntil(this.destroy$)
      .subscribe(([accounts, regions, existingLoadBalancerNames, subnets]) => {
        return this.setState({ accounts, regions, existingLoadBalancerNames, subnets });
      });
  }

  public componentDidUpdate() {
    this.props$.next(this.props);
  }

  public componentWillUnmount(): void {
    this.destroy$.next();
  }

  private internalFlagChanged = (event: React.ChangeEvent<any>): void => {
    this.setState({ internalFlagToggled: true });
    this.props.formik.handleChange(event);
  };

  private getAvailableSubnets(credentials: string, region: string): IPromise<ISubnet[]> {
    return SubnetReader.listSubnetsByProvider('tencent').then(subnets => {
      return chain(subnets)
        .filter({ account: credentials, region })
        .value();
    });
  }

  private handleSubnetUpdated = (subnetType: string): void => {
    this.props.formik.setFieldValue('subnetType', subnetType);
  };

  private makeSubnetOptions(availableSubnets: ISubnet[]): ISubnetOption[] {
    return availableSubnets.map(({ id, name, vpcId }) => ({
      id,
      name,
      vpcId,
    }));
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

  public render() {
    const { app } = this.props;
    const { errors, values } = this.props.formik;
    const { accounts, hideInternalFlag, regions, subnets } = this.state;

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
                <HelpField id="tencent.loadBalancer.name" />
                <Field type="text" style={{ display: 'none' }} className="form-control input-sm no-spel" name="name" />
                {errors.name && <ValidationMessage type="error" message={errors.name} />}
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-3 sm-label-right">Account</div>
              <div className="col-md-7">
                <AccountSelectInput
                  value={values.credentials}
                  onChange={(evt: any) => this.accountUpdated(evt.target.value)}
                  accounts={accounts}
                  provider="tencent"
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
              <div className="col-md-3 sm-label-right">
                Stack <HelpField id="tencent.loadBalancer.stack" />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className={`form-control input-sm no-spel ${errors.stack ? 'invalid' : ''}`}
                  value={values.stack}
                  name="stack"
                  onChange={this.stackChanged}
                />
              </div>
              <div className="col-md-6 form-inline">
                <label className="sm-label-right">
                  <span>
                    Detail <HelpField id="tencent.loadBalancer.detail" />{' '}
                  </span>
                </label>
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

            <SubnetSelectField
              labelColumns={3}
              helpKey="tencent.loadBalancer.subnet"
              component={values}
              field="subnetType"
              region={values.region}
              subnets={subnets as any}
              application={app}
              onChange={() => this.handleSubnetUpdated(values.subnetType)}
            />
            {values.vpcId && !hideInternalFlag && (
              <div className="form-group">
                <div className="col-md-3 sm-label-right">
                  <b>Internal</b> <HelpField id="tencent.loadBalancer.internal" />
                </div>
                <div className="col-md-7 checkbox">
                  <label>
                    <Field
                      name="isInternal"
                      onChange={this.internalFlagChanged}
                      render={({ field: { value, ...field } }: FieldProps) => (
                        <input type="checkbox" {...field} checked={!!value} />
                      )}
                    />
                    Create an internal load balancer
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
