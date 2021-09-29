import _ from 'lodash';
import React from 'react';
import { arrayMove, SortEnd } from 'react-sortable-hoc';

import { CpuCreditsToggle } from '../CpuCreditsToggle';
import { CustomHeading, CustomTableFooter, CustomTableHeader } from './Custom';
import { InstanceTypeTableBody } from './InstanceTypeTableBody';
import { NonCustomHeading, NonCustomTableHeader } from './NonCustom';
import { AWSProviderSettings } from '../../../../../aws.settings';
import { IAmazonInstanceTypeCategory } from '../../../../../instance/awsInstanceType.service';
import { IAmazonInstanceTypeOverride } from '../../../serverGroupConfiguration.service';

import './advancedMode.less';

export interface IInstanceTypeTableProps {
  currentProfile: string;
  selectedInstanceTypesMap: Map<string, IAmazonInstanceTypeOverride>;
  unlimitedCpuCreditsInCmd: boolean;
  profileDetails: IAmazonInstanceTypeCategory;
  availableInstanceTypesList: string[];
  handleInstanceTypesChange: (instanceTypes: IAmazonInstanceTypeOverride[]) => void;
  setUnlimitedCpuCredits: (unlimitedCpuCredits: boolean | undefined) => void;
}

export function InstanceTypeTable(props: IInstanceTypeTableProps) {
  const handleSortEnd = (sortEnd: SortEnd): void => {
    const sortedInstanceTypes: string[] = Array.from(props.selectedInstanceTypesMap.values())
      .sort((i1, i2) => i1.priority - i2.priority)
      .map((it) => it.instanceType);
    const instanceTypesInNewOrder = arrayMove(sortedInstanceTypes, sortEnd.oldIndex, sortEnd.newIndex);

    updatePriorityForSelectedTypes(instanceTypesInNewOrder);
  };

  const updatePriorityForSelectedTypes = (instanceTypesInNewOrder: string[]): void => {
    props.selectedInstanceTypesMap.forEach((value, key) => {
      const newPriority = 1 + instanceTypesInNewOrder.indexOf(key);
      if (value.priority !== newPriority) {
        value.priority = newPriority;
      }
    });
    props.handleInstanceTypesChange(Array.from(props.selectedInstanceTypesMap.values()));
  };

  const removeInstanceType = (instanceType: string): void => {
    const selectedInstanceTypesMapNew = new Map(props.selectedInstanceTypesMap);
    selectedInstanceTypesMapNew.delete(instanceType);
    props.handleInstanceTypesChange(Array.from(selectedInstanceTypesMapNew.values()));
  };

  const addOrUpdateInstanceType = (type: string, weight: string) => {
    const weightNum = Number(weight);
    const itemToUpdate = props.selectedInstanceTypesMap.has(type)
      ? {
          ...props.selectedInstanceTypesMap.get(type), // update existing item
          weightedCapacity: !_.isNaN(weightNum) && weightNum !== 0 ? weightNum : undefined,
        }
      : {
          instanceType: type, // new item
          weightedCapacity: !_.isNaN(weightNum) && weightNum !== 0 ? weightNum : undefined,
          priority:
            1 +
            Array.from(props.selectedInstanceTypesMap.values()).reduce(
              (max, it) => (it.priority > max ? it.priority : max),
              0,
            ),
        };
    props.selectedInstanceTypesMap.set(type, itemToUpdate);
    props.handleInstanceTypesChange(Array.from(props.selectedInstanceTypesMap.values()));
  };

  const isCpuCreditsEnabled: boolean = AWSProviderSettings.serverGroups?.enableCpuCredits;
  const selectedInstanceTypeNames = Array.from(props.selectedInstanceTypesMap.keys());
  const cpuCreditsToggle = (
    <div>
      <CpuCreditsToggle
        unlimitedCpuCredits={props.unlimitedCpuCreditsInCmd}
        currentProfile={props.currentProfile}
        selectedInstanceTypes={selectedInstanceTypeNames}
        setUnlimitedCpuCredits={props.setUnlimitedCpuCredits}
      />
    </div>
  );

  if (props.currentProfile && props.currentProfile !== 'custom') {
    return (
      <div className={'row sub-section'}>
        <NonCustomHeading
          profileLabel={props.profileDetails.label}
          profileDescriptionArr={
            props.profileDetails.descriptionListOverride
              ? props.profileDetails.descriptionListOverride
              : props.profileDetails.families.map((f) => f.description)
          }
        />
        {isCpuCreditsEnabled && cpuCreditsToggle}
        <table className="table table-hover">
          <NonCustomTableHeader showCpuCredits={props.profileDetails.showCpuCredits} />
          <InstanceTypeTableBody
            isCustom={false}
            profileFamiliesDetails={props.profileDetails.families}
            selectedInstanceTypesMap={props.selectedInstanceTypesMap}
            addOrUpdateInstanceType={addOrUpdateInstanceType}
            removeInstanceType={removeInstanceType}
            handleSortEnd={handleSortEnd}
          />
        </table>
      </div>
    );
  } else {
    return (
      <div className={'row sub-section'}>
        <CustomHeading />
        {isCpuCreditsEnabled && cpuCreditsToggle}
        <table className="table table-hover">
          <CustomTableHeader />
          <InstanceTypeTableBody
            isCustom={true}
            selectedInstanceTypesMap={props.selectedInstanceTypesMap}
            addOrUpdateInstanceType={addOrUpdateInstanceType}
            removeInstanceType={removeInstanceType}
            handleSortEnd={handleSortEnd}
          />
          <CustomTableFooter
            availableInstanceTypesList={props.availableInstanceTypesList.filter(
              (it) => !selectedInstanceTypeNames.includes(it),
            )}
            addOrUpdateInstanceType={addOrUpdateInstanceType}
          />
        </table>
      </div>
    );
  }
}
