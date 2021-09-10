import _ from 'lodash';
import React from 'react';
import { SortableContainer, SortEnd } from 'react-sortable-hoc';

import { IInstanceTypeFamily } from '@spinnaker/core';

import { NonSortableRow } from './NonSortableRow';
import SortableRow from './SortableRow';
import { IAmazonPreferredInstanceType } from '../../../../../../instance/awsInstanceType.service';
import { IAmazonInstanceTypeOverride } from '../../../../serverGroupConfiguration.service';

export function NonCustomTableBody(props: {
  profileFamiliesDetails: IInstanceTypeFamily[];
  selectedInstanceTypesMap: Map<string, IAmazonInstanceTypeOverride>;
  addOrUpdateInstanceType: (instanceType: string, weight: string) => void;
  handleSortEnd: (sortEnd: SortEnd) => void;
  removeInstanceType: (instanceType: string) => void;
}) {
  return (
    <SortableRows
      instanceTypesDetails={
        new Map(
          Object.entries(
            _.keyBy(_.flatten(props.profileFamiliesDetails.map((f: IInstanceTypeFamily) => f.instanceTypes)), 'name'),
          ),
        )
      }
      selectedInstanceTypesMap={props.selectedInstanceTypesMap}
      removeInstanceType={props.removeInstanceType}
      addOrUpdateInstanceType={props.addOrUpdateInstanceType}
      onSortEnd={props.handleSortEnd}
      distance={1}
    />
  );
}

const SortableRows = SortableContainer(
  (props: {
    instanceTypesDetails: Map<string, IAmazonPreferredInstanceType>;
    selectedInstanceTypesMap: Map<string, IAmazonInstanceTypeOverride>;
    removeInstanceType: (typeToRemove: string) => void;
    addOrUpdateInstanceType: (instanceType: string, weight: string) => void;
  }) => {
    const instanceTypesInProfile: string[] = Array.from(props.instanceTypesDetails.keys());
    const unselectedInstanceTypes: string[] = _.difference(
      instanceTypesInProfile,
      Array.from(props.selectedInstanceTypesMap.keys()),
    );

    const selectedRowsOrdered: IAmazonInstanceTypeOverride[] = Array.from(props.selectedInstanceTypesMap.values())
      .filter((selectedType: IAmazonInstanceTypeOverride) => instanceTypesInProfile.includes(selectedType.instanceType))
      .sort((i1, i2) => i1.priority - i2.priority);

    return (
      <tbody>
        {selectedRowsOrdered &&
          selectedRowsOrdered.length > 0 &&
          selectedRowsOrdered.map((selectedType: IAmazonInstanceTypeOverride, index) => {
            return (
              <SortableRow
                key={index}
                index={index}
                selectedType={selectedType}
                instanceTypeDetails={props.instanceTypesDetails.get(selectedType.instanceType)}
                removeInstanceType={props.removeInstanceType}
                updateWeight={props.addOrUpdateInstanceType}
              />
            );
          })}
        {unselectedInstanceTypes &&
          unselectedInstanceTypes.length > 0 &&
          unselectedInstanceTypes.map((instanceType, index) => {
            return (
              <NonSortableRow
                key={index}
                instanceTypeDetails={props.instanceTypesDetails.get(instanceType)}
                addOrUpdateInstanceType={props.addOrUpdateInstanceType}
              />
            );
          })}
      </tbody>
    );
  },
);
