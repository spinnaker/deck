import React, { useState } from 'react';

import { Tooltip } from '@spinnaker/core';

import { IAmazonPreferredInstanceType } from '../../../../../../instance/awsInstanceType.service';
import { CostFactor } from '../../../../../../instance/details/CostFactor';

import '../advancedMode.less';

export function NonSortableRow(props: {
  instanceTypeDetails: IAmazonPreferredInstanceType;
  addOrUpdateInstanceType: (instanceType: string, weight: string) => void;
}) {
  const [weightedCap, setWeightedCap] = useState('');
  const instanceType = props.instanceTypeDetails.name;
  const disableRow = props.instanceTypeDetails.unavailable;

  const selectRow = () => {
    if (!disableRow) {
      props.addOrUpdateInstanceType(instanceType, weightedCap);
    }
    setWeightedCap('');
  };

  return (
    <tr
      key={instanceType}
      className={`non-sortable ${disableRow ? 'unavailable' : 'clickable'}`}
      onClick={(e) => {
        if (!$(e.target).is('input')) {
          selectRow();
        }
      }}
      title={
        disableRow
          ? 'This instance type is not available for the selected configuration'
          : 'Click to select instance type'
      }
    >
      <td></td>
      <td>
        <input id={`selectInstanceType-${instanceType}`} type={'checkbox'} disabled={disableRow} onChange={selectRow} />
      </td>
      <td>{instanceType}</td>
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
        <Tooltip value={!disableRow ? 'Enter optional weight (allowed values: 1 to 999).' : ''}>
          <input
            className="form-control input input-sm"
            id={`weightedCapacity-${instanceType}`}
            type="text"
            pattern="[0-9]*"
            placeholder="Enter optional weight (allowed values: 1 to 999)."
            disabled={disableRow}
            value={weightedCap}
            onChange={(e) => {
              setWeightedCap(e.target.value);
              document.getElementById(`selectInstanceType-${instanceType}`).focus();
            }}
          />
        </Tooltip>
      </td>
    </tr>
  );
}
