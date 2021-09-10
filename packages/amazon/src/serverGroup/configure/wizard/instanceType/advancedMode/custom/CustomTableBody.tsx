import React from 'react';
import { SortableContainer, SortableElement, SortableHandle, SortEnd } from 'react-sortable-hoc';

import { Tooltip } from '@spinnaker/core';

import { IAmazonInstanceTypeOverride } from '../../../../serverGroupConfiguration.service';

export function CustomTableBody(props: {
  selectedInstanceTypesMap: Map<string, IAmazonInstanceTypeOverride>;
  addOrUpdateInstanceType: (instanceType: string, weight: string) => void;
  handleSortEnd: (sortEnd: SortEnd) => void;
  removeInstanceType: (instanceType: string) => void;
}) {
  return (
    <SortableRows
      selectedInstanceTypesMap={props.selectedInstanceTypesMap}
      updateWeight={props.addOrUpdateInstanceType}
      removeInstanceType={props.removeInstanceType}
      onSortEnd={(sortEnd) => props.handleSortEnd(sortEnd)}
      distance={1}
    />
  );
}

const SortableRows = SortableContainer(
  (props: {
    selectedInstanceTypesMap: Map<string, IAmazonInstanceTypeOverride>;
    updateWeight: (instanceType: string, weight: string) => void;
    removeInstanceType: (typeToRemove: string) => void;
  }) => (
    <tbody>
      {Array.from(props.selectedInstanceTypesMap.values())
        .sort((i1, i2) => i1.priority - i2.priority)
        .map((selectedType, index) => (
          <SortableRow
            key={index}
            index={index}
            selected={selectedType}
            updateWeight={props.updateWeight}
            removeInstanceType={props.removeInstanceType}
          />
        ))}
    </tbody>
  ),
);

const SortableRow = SortableElement(
  (props: {
    selected: IAmazonInstanceTypeOverride;
    updateWeight: (instanceType: string, weight: string) => void;
    removeInstanceType: (typeToRemove: string) => void;
  }) => (
    <tr className={'sortable'}>
      <td>
        <DragHandle />
      </td>
      <td>{props.selected.instanceType}</td>
      <td>
        <Tooltip value={'Enter optional weight (allowed values: 1 to 999).'}>
          <input
            className="form-control "
            type="text"
            pattern="[0-9]*"
            placeholder="Enter optional weight (allowed values: 1 to 999)."
            value={props.selected.weightedCapacity || ''}
            onChange={(e) => props.updateWeight(props.selected.instanceType, e.target.value)}
          />
        </Tooltip>
      </td>
      <td>
        <div>
          <span>
            <a
              className="btn btn-sm btn-link clickable"
              onClick={() => props.removeInstanceType(props.selected.instanceType)}
              style={{ padding: '5px' }}
            >
              <Tooltip value={'Remove instance type'}>
                <span className="glyphicon glyphicon-trash" />
              </Tooltip>
            </a>
          </span>
        </div>
      </td>
    </tr>
  ),
);

const DragHandle = SortableHandle(() => (
  <Tooltip value={'Drag to change priority'}>
    <span className="instance-type-drag-handle glyphicon glyphicon-resize-vertical" />
  </Tooltip>
));
