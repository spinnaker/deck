import React from 'react';

import {
  FormikFormField,
  HelpField,
  ILayoutProps,
  NumberInput,
  ReactSelectInput,
  TextInput,
  Tooltip,
} from '@spinnaker/core';

import { IAmazonServerGroupCommand } from '../../../serverGroupConfiguration.service';

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

    if (field === 'spotAllocationStrategy' && value !== 'lowest-price' && props.spotInstancePools !== undefined) {
      props.setFieldValue('spotInstancePools', undefined);
    }
  };

  return (
    <>
      <div className={'row sub-section form-group'}>
        <h4>Instances Distribution</h4>
        <div className={'description'}>
          Diversify and distribute instance types across purchase options.{' '}
          <HelpField id={'aws.serverGroup.instancesDistribution'} />
        </div>
        <br />
        <FormikFormField
          label={'Spot Allocation Strategy'}
          name={'spotAllocationStrategy'}
          help={<HelpField id={'aws.serverGroup.spotAllocationStrategy'} />}
          layout={FormFieldLayout}
          input={(inputProps) => (
            <ReactSelectInput
              {...inputProps}
              options={spotAllocStrategyOptions}
              clearable={true}
              inputClassName={'input-sm'}
              removeSelected={true}
              onChange={(e) => {
                handleChange('spotAllocationStrategy', e.target.value);
              }}
              value={
                spotAllocStrategyOptions.find((o) => o.value === props.spotAllocationStrategy) || 'capacity-optimized'
              }
            />
          )}
        />
        {props.spotAllocationStrategy === 'lowest-price' && (
          <FormikFormField
            label={'Spot Instance Pools Count'}
            name={'spotInstancePoolCount'}
            help={<HelpField id={'aws.serverGroup.spotInstancePoolCount'} />}
            layout={FormFieldLayout}
            input={(inputProps) => (
              <NumberInput
                {...inputProps}
                inputClassName={'input-sm'}
                onChange={(e) => handleChange('spotInstancePools', Number.parseInt(e.target.value))}
                value={props.spotInstancePools || 2}
              />
            )}
          />
        )}
        {/* AWS default is 2 */}
        <FormikFormField
          label={'On-Demand Allocation Strategy'}
          name={'odAllocationStrategy'}
          help={<HelpField id={'aws.serverGroup.odAllocationStrategy'} />}
          layout={FormFieldLayout}
          input={(inputProps) => (
            <TextInput
              {...inputProps}
              inputClassName={'input-sm'}
              readOnly={true}
              disabled={true}
              value={props.onDemandAllocationStrategy || 'prioritized'}
            />
          )}
        />
        {/* prioritized is the only supported strategy for now */}
        <FormikFormField
          label={'On-Demand Base Capacity'}
          name={'odBaseCapacity'}
          help={<HelpField id={'aws.serverGroup.odBase'} />}
          layout={FormFieldLayout}
          input={(inputProps) => (
            <NumberInput
              {...inputProps}
              inputClassName={'input-sm'}
              onChange={(e) => handleChange('onDemandBaseCapacity', Number.parseInt(e.target.value))}
              value={props.onDemandBaseCapacity || 0}
            />
          )}
        />
        {/* AWS Default is 0 */}
        <FormikFormField
          label={'On-Demand Percentage Above Base Capacity'}
          name={'odPercentAboveBase'}
          help={<HelpField id={'aws.serverGroup.odPercentAboveBase'} />}
          layout={FormFieldLayout}
          input={(inputProps) => (
            <NumberInput
              {...inputProps}
              inputClassName={'input-sm'}
              onChange={(e) => handleChange('onDemandPercentageAboveBaseCapacity', Number.parseInt(e.target.value))}
              value={props.onDemandPercentageAboveBaseCapacity || 100}
            />
          )}
        />
        {/* AWS Default is 100 */}
        <FormikFormField
          label={'Spot Max Price'}
          name={'spotPrice'}
          help={<HelpField id={'aws.serverGroup.spotMaxPrice'} />}
          layout={FormFieldLayout}
          input={(inputProps) => (
            <Tooltip value={'Recommended to leave empty and use AWS default i.e. On-Demand price'}>
              <TextInput
                {...inputProps}
                inputClassName={'input-sm'}
                onChange={(e) => handleChange('spotPrice', e.target.value)}
                placeholder={'Recommended to leave empty and use AWS default i.e. On-Demand price'}
                onFocus={(e) => (e.target.placeholder = '')}
                value={props.spotMaxPrice || ''}
              />
            </Tooltip>
          )}
        />
      </div>
    </>
  );
}

const FormFieldLayout = (props: ILayoutProps) => {
  const { label, help, input } = props;
  return (
    <div className="form-group flex-container-h baseline margin-between-sm">
      <div className="bold sm-label-right col-sm-6">
        {label} {help}
      </div>
      <div className="flex-grow">{input}</div>
    </div>
  );
};
