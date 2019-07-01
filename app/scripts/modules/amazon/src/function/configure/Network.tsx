import * as React from 'react';
import { Option } from 'react-select';
import { IPromise } from 'angular';
import { Observable, Subject } from 'rxjs';
import { forOwn } from 'lodash';

import {
  Application,
  FormikFormField,
  IWizardPageComponent,
  IVpc,
  ISubnet,
  HelpField,
  IAccount,
  IRegion,
  ReactSelectInput,
  TetheredSelect,
  SubnetReader,
  ReactInjector,
  ISecurityGroupsByAccountSourceData,
} from '@spinnaker/core';
import { FormikErrors, FormikProps } from 'formik';
import { IAmazonFunctionUpsertCommand } from 'amazon/index';
import { VpcReader } from 'amazon/vpc';

export interface ISubnetOption {
  subnetId: string;
  vpcId: string;
}

export interface INetworkProps {
  formik: FormikProps<IAmazonFunctionUpsertCommand>;
  isNew?: boolean;
  app: Application;
}

export interface INetworkState {
  vpcOptions: Array<{}>;
  accounts: IAccount[];
  regions: IRegion[];
  subnets: ISubnetOption[];
  securityGroups: ISecurityGroupsByAccountSourceData;
}

export class Network extends React.Component<INetworkProps, INetworkState>
  implements IWizardPageComponent<IAmazonFunctionUpsertCommand> {
  constructor(props: INetworkProps) {
    super(props);
    this.getAllVpcs();
    // this.getAllSubnets();
  }

  public state: INetworkState = {
    vpcOptions: [],
    accounts: null,
    regions: [],
    subnets: [],
    securityGroups: null,
  };
  private props$ = new Subject<INetworkProps>();
  private destroy$ = new Subject<void>();

  private getAllVpcs(): void {
    VpcReader.listVpcs().then(Vpcs => {
      this.state.vpcOptions = Vpcs;
    });
  }

  public validate(): FormikErrors<IAmazonFunctionUpsertCommand> {
    return {};
  }

  private getAvailableSubnets(): IPromise<ISubnet[]> {
    return SubnetReader.listSubnetsByProvider('aws');
  }

  private getAvailableSecurityGroups(): IPromise<ISecurityGroupsByAccountSourceData> {
    return ReactInjector.securityGroupReader.getAllSecurityGroups();
  }
  private makeSubnetOptions(availableSubnets: ISubnet[]): ISubnetOption[] {
    const subOptions: ISubnetOption[] = [];
    availableSubnets.forEach(s => {
      const opt: ISubnetOption = {
        subnetId: s.id,
        vpcId: s.vpcId,
      };
      subOptions.push(opt);
    });
    // we have to filter out any duplicate options
    const uniqueSubOptions = Array.from(new Set(subOptions.map(a => a.subnetId))).map(subnetId => {
      return subOptions.find(a => a.subnetId === subnetId);
    });
    return uniqueSubOptions;
  }

  public componentDidUpdate() {
    this.props$.next(this.props);
  }

  public componentWillUnmount(): void {
    this.destroy$.next();
  }

  public componentDidMount(): void {
    const subnets$ = Promise.resolve(this.getAvailableSubnets())
      .then((subnets: ISubnet[]) => {
        subnets.forEach((subnet: ISubnet) => {
          subnet.label = subnet.id;
          subnet.deprecated = !!subnet.deprecated;
          if (subnet.deprecated) {
            subnet.label += ' (deprecated)';
          }
        });
        return subnets.filter(s => s.label);
      })
      .then((subnets: ISubnet[]) => {
        return this.makeSubnetOptions(subnets);
      });

    const secGroups$ = Promise.resolve(this.getAvailableSecurityGroups());
    Observable.combineLatest(subnets$, secGroups$)
      .takeUntil(this.destroy$)
      .subscribe(([subnets, securityGroups]) => {
        return this.setState({ subnets, securityGroups });
      });
  }

  private handleSubnetUpdate = (options: Array<Option<string>>) => {
    const subnetsSelected = options.map(o => o.value);
    this.props.formik.setFieldValue('subnetIds', subnetsSelected);
  };

  private handleSecurityGroupsUpdate = (options: Array<Option<string>>) => {
    const sgSelected = options.map(o => o.value);
    this.props.formik.setFieldValue('securityGroupIds', sgSelected);
  };

  private handleVpcChange = (vpcId: string): void => {
    this.props.formik.setFieldValue('vpcId', vpcId);
    const { subnets } = this.state;
    const subs = subnets.filter(function(s: ISubnetOption) {
      return s.vpcId.includes(vpcId);
    });
    this.setState({ subnets: subs });
  };

  private toSubnetOption = (value: ISubnetOption): Option<string> => {
    return { value: value.subnetId, label: value.subnetId };
  };

  private getSecurityGroupsByVpc = (sgs: ISecurityGroupsByAccountSourceData): Option<string>[] => {
    const { values } = this.props.formik;
    const sgOptions: Option<string>[] = [];
    forOwn(sgs, function(sgByAccount, acc) {
      if (acc === values.credentials) {
        forOwn(sgByAccount, function(sgByRegion, provider) {
          if (provider === 'aws') {
            forOwn(sgByRegion, function(groups, region) {
              if (region === values.region) {
                groups.forEach(function(group) {
                  if (group.vpcId === values.vpcId) {
                    sgOptions.push({ value: group.id, label: group.name });
                  }
                });
              }
            });
          }
        });
      }
    });
    return sgOptions;
  };

  public render() {
    const { vpcOptions, subnets, securityGroups } = this.state;
    const { values } = this.props.formik;
    const subnetOptions = (subnets || []).map(this.toSubnetOption);
    const sgOptions = securityGroups ? this.getSecurityGroupsByVpc(securityGroups) : [];
    return (
      <div className="form-group">
        <div className="col-md-11">
          <div className="sp-margin-m-bottom">
            {values.credentials && (
              <FormikFormField
                name="vpcId"
                label="VPC Id"
                help={<HelpField id="aws.function.vpc.id" />}
                fastField={false}
                input={props => (
                  <ReactSelectInput
                    inputClassName="cloudfoundry-react-select"
                    {...props}
                    stringOptions={vpcOptions
                      .filter((v: IVpc) => v.account === values.credentials)
                      .map((v: IVpc) => v.id)}
                    clearable={true}
                    value={values.vpcId}
                  />
                )}
                onChange={this.handleVpcChange}
                required={false}
              />
            )}
          </div>
          <div className="form-group">
            <div className="col-md-4 sm-label-right">
              <b>Subnets </b>
              <HelpField id="aws.function.subnet" />
            </div>
            <div className="col-md-7">
              {subnetOptions.length === 0 && (
                <div className="form-control-static">No subnets found in the selected account/region/VPC</div>
              )}
              {values.vpcId ? (
                <TetheredSelect
                  multi={true}
                  options={subnetOptions}
                  value={values.subnetIds}
                  onChange={this.handleSubnetUpdate}
                />
              ) : null}
            </div>
          </div>
          <div className="form-group">
            <div className="col-md-4 sm-label-right">
              <b>Security Groups </b>
              <HelpField id="aws.function.subnet" />
            </div>
            <div className="col-md-7">
              {sgOptions.length === 0 && (
                <div className="form-control-static">No security groups found in the selected account/region/VPC</div>
              )}
              {values.credentials && values.credentials !== 'test' && values.vpcId ? (
                <TetheredSelect
                  multi={true}
                  options={sgOptions}
                  value={values.securityGroupIds}
                  onChange={this.handleSecurityGroupsUpdate}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
