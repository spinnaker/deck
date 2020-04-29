import * as React from 'react';

import { Application, ISubnet, HelpField } from '@spinnaker/core';

import { SubnetSelectInput } from './SubnetSelectInput';

import { Option } from 'react-select';
import VirtualizedSelect from 'react-virtualized-select';

export interface ISubnetSelectFieldProps {
  application: Application;
  component: { [key: string]: any };
  field: string;
  helpKey: string;
  hideClassic?: boolean;
  labelColumns: number;
  onChange: () => void;
  readOnly?: boolean;
  region: string;
  subnets: ISubnet[];
  multi?: boolean;
}

export class SubnetSelectField extends React.Component<ISubnetSelectFieldProps> {
  private handleChange = (event: React.ChangeEvent<any>) => {
    const { component, onChange, field } = this.props;
    component[field] = event.target.value;
    onChange();
  };

  private handleMultiChange = (options: Option[]) => {
    const { component, onChange, field } = this.props;
    component[field] = options.map(o => o.value as string);
    onChange();
  };

  public render() {
    const { labelColumns, helpKey, component, region, field, multi, subnets, ...otherProps } = this.props;
    const value = component[field];

    return (
      <div className="form-group">
        <div className={`col-md-${labelColumns} sm-label-right`}>
          Subnet <HelpField id={helpKey} />
        </div>

        <div className="col-md-7">
          {multi ? (
            component.vpcId ? (
              <VirtualizedSelect
                ignoreAccents={true}
                options={subnets.map(item => ({ label: `${item.name}(${item.id})`, value: item.id }))}
                onChange={this.handleMultiChange}
                value={value}
                multi={true}
              />
            ) : (
              '(Select a VPC)'
            )
          ) : region ? (
            <SubnetSelectInput
              {...otherProps}
              subnets={subnets}
              inputClassName="form-control input-sm"
              credentials={component.credentials}
              region={region}
              value={value}
              onChange={this.handleChange}
            />
          ) : (
            '(Select a region)'
          )}
        </div>
      </div>
    );
  }
}
