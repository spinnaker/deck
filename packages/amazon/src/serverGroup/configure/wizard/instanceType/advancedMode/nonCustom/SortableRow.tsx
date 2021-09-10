import React from 'react';
import { Checkbox } from 'react-bootstrap';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';

import { Tooltip } from '@spinnaker/core';

import { IAmazonPreferredInstanceType } from '../../../../../../instance/awsInstanceType.service';
import { CostFactor } from '../../../../../../instance/details/CostFactor';
import { IAmazonInstanceTypeOverride } from '../../../../serverGroupConfiguration.service';

const SortableRow = SortableElement(
  (props: {
    index: number;
    selectedType: IAmazonInstanceTypeOverride;
    instanceTypeDetails: IAmazonPreferredInstanceType;
    removeInstanceType: (typeToRemove: string) => void;
    updateWeight: (instanceType: string, weight: string) => void;
  }) => {
    const instanceType = props.selectedType.instanceType;
    const unselectRow = () => {
      props.removeInstanceType(instanceType);
    };
    return (
      <tr
        className={'sortable clickable'}
        title={'Click to unselect instance type'}
        onClick={(e) => {
          if (!$(e.target).is('input')) {
            unselectRow();
          }
        }}
      >
        <td>
          <DragHandle />
        </td>
        <td>
          <Checkbox checked={true} onChange={unselectRow} />
        </td>
        <td>{props.selectedType.instanceType}</td>
        <td>{props.instanceTypeDetails.cpu}</td>
        <td>{props.instanceTypeDetails.memory}</td>
        {props.instanceTypeDetails.cpuCreditsPerHour ? (
          <td>{props.instanceTypeDetails.cpuCreditsPerHour}</td>
        ) : (
          <td title={'Cpu credits not applicable to instance type.'}>-</td>
        )}
        {props.instanceTypeDetails.storage.type === 'EBS' && <td>EBS Only</td>}
        {props.instanceTypeDetails.storage.type === 'SSD' && (
          <td>{props.instanceTypeDetails.storage.count + 'x' + props.instanceTypeDetails.storage.size}</td>
        )}
        <td>
          <CostFactor costFactor={props.instanceTypeDetails.costFactor} />
        </td>
        <td>
          <Tooltip value={'Enter optional weight (allowed values: 1 to 999).'}>
            <input
              className="form-control input input-sm"
              type="text"
              pattern="[0-9]*"
              placeholder="Enter optional weight (allowed values: 1 to 999)."
              value={props.selectedType.weightedCapacity || ''}
              onChange={(e) => props.updateWeight(props.selectedType.instanceType, e.target.value)}
            />
          </Tooltip>
        </td>
      </tr>
    );
  },
);

const DragHandle = SortableHandle(() => (
  <Tooltip value={'Drag to change priority'}>
    <span className="instance-type-drag-handle glyphicon glyphicon-resize-vertical" />
  </Tooltip>
));

export default SortableRow;
