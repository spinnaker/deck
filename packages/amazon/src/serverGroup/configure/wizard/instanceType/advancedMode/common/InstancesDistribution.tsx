import React from 'react';
import Select, { Option } from 'react-select';
import { HelpField, Tooltip } from '@spinnaker/core';
import { IAmazonServerGroupCommand } from '../../../../serverGroupConfiguration.service';

export interface IInstancesDistributionProps {
  onDemandAllocationStrategy: string;
  onDemandBaseCapacity: number;
  onDemandPercentageAboveBaseCapacity: number;
  spotAllocationStrategy: string;
  spotInstancePools: number;
  spotMaxPrice: string;
  setFieldValue: (field: keyof IAmazonServerGroupCommand, value: any, shouldValidate?: boolean) => void;
}

export function InstancesDistribution(props: IInstancesDistributionProps) {
  const spotAllocStrategyOptions = [
    { label: 'capacity-optimized (recommended)', value: 'capacity-optimized' },
    { label: 'capacity-optimized-prioritized', value: 'capacity-optimized-prioritized' },
    { label: 'lowest-price', value: 'lowest-price' },
  ];

  const handleChange = (field: keyof IAmazonServerGroupCommand, value: string | number) => {
    props.setFieldValue(field, value);

    // reset spotInstancePools conditionally
    if (field === 'spotAllocationStrategy' && value !== 'lowest-price' && props.spotInstancePools !== undefined) {
      props.setFieldValue('spotInstancePools', undefined);
    }
  };

  return (
    <div className={'row sub-section'}>
      <h4>Instances Distribution</h4>
      <div className={'description'}>
        Diversify and distribute instance types across purchase options.{' '}
        <HelpField id={'aws.serverGroup.instancesDistribution'} />
      </div>
      <br />
      <div className={'form-group'}>
        <label className={'sm-label-right col-sm-6'}>
          Spot Allocation Strategy <HelpField id={'aws.serverGroup.spotAllocationStrategy'} />
        </label>
        <div className={'col-sm-5'}>
          <Select
            className={'form-control input-sm'}
            id={'spot-alloc'}
            clearable={true}
            removeSelected={true}
            options={spotAllocStrategyOptions}
            onChange={(o: Option<string>) => handleChange('spotAllocationStrategy', o.value)}
            value={spotAllocStrategyOptions.find(
              (o) => o.value === (props.spotAllocationStrategy || 'capacity-optimized'),
            )}
          />
        </div>
      </div>
      {props.spotAllocationStrategy === 'lowest-price' && (
        <div className={'form-group'}>
          <label className={'sm-label-right col-sm-6'}>
            Spot Instance Pools Count <HelpField id={'aws.serverGroup.spotInstancePoolCount'} />
          </label>
          <div className={'col-sm-5'}>
            <input
              type={'text'}
              className={'form-control input-sm'}
              pattern="[0-9]*"
              onChange={(e) => handleChange('spotInstancePools', Number(e.target.value))}
              value={props.spotInstancePools || 2}
            />{' '}
            {/* AWS default is 2 */}
          </div>
        </div>
      )}
      <div className={'form-group'}>
        <label className={'sm-label-right col-sm-6'}>
          On-Demand Allocation Strategy <HelpField id={'aws.serverGroup.odAllocationStrategy'} />
        </label>
        <div className={'col-sm-5'}>
          <input
            type={'text'}
            className={'form-control input-sm'}
            readOnly={true}
            disabled={true}
            value={props.onDemandAllocationStrategy || 'prioritized'}
          />{' '}
          {/* prioritized is the only supported strategy for now */}
        </div>
      </div>
      <div className={'form-group'}>
        <label className={'sm-label-right col-sm-6'}>
          On-Demand Base Capacity <HelpField id={'aws.serverGroup.odBase'} />
        </label>
        <div className={'col-sm-5'}>
          <input
            type={'text'}
            className={'form-control input-sm'}
            pattern="[0-9]*"
            onChange={(e) => handleChange('onDemandBaseCapacity', Number(e.target.value))}
            value={props.onDemandBaseCapacity || 0}
          />{' '}
          {/* AWS Default is 0 */}
        </div>
      </div>
      <div className={'form-group'}>
        <label className={'sm-label-right col-sm-6'}>
          On-Demand Percentage Above Base Capacity <HelpField id={'aws.serverGroup.odPercentAboveBase'} />
        </label>
        <div className={'col-sm-5'}>
          <input
            type={'text'}
            className={'form-control input-sm'}
            pattern="[0-9]*"
            onChange={(e) => handleChange('onDemandPercentageAboveBaseCapacity', Number(e.target.value))}
            value={props.onDemandPercentageAboveBaseCapacity || 100}
          />{' '}
          {/* AWS Default is 100 */}
        </div>
      </div>
      <div className={'form-group'}>
        <label className={'sm-label-right col-sm-6'}>
          Spot Max Price <HelpField id={'aws.serverGroup.spotMaxPrice'} />
        </label>
        <div className={'col-sm-5'}>
          <Tooltip value={'Recommended to leave empty and use AWS default i.e. On-Demand price'}>
            <input
              type={'text'}
              className={'form-control input-sm'}
              onChange={(e) => handleChange('spotPrice', e.target.value)}
              placeholder={'Recommended to leave empty and use AWS default i.e. On-Demand price'}
              onFocus={(e) => (e.target.placeholder = '')}
              value={props.spotMaxPrice || ''}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
