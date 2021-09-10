import React from 'react';
import Select, { Option } from 'react-select';

export function CustomTableFooter(props: {
  availableInstanceTypesList: string[];
  addOrUpdateInstanceType: (type: string, weight: string) => void;
}) {
  return (
    <tfoot>
      <tr>
        <td>
          <span className={'glyphicon glyphicon-plus-sign'} style={{ paddingTop: '8px' }} />
        </td>
        <td colSpan={2}>
          <InstanceTypeSelect
            availableInstanceTypesList={props.availableInstanceTypesList}
            addOrUpdateInstanceType={props.addOrUpdateInstanceType}
          />
        </td>
        <td></td>
      </tr>
    </tfoot>
  );
}

const InstanceTypeSelect = (props: {
  availableInstanceTypesList: string[];
  addOrUpdateInstanceType: (type: string, weight: string) => void;
}): JSX.Element => {
  const instanceTypeListOptions = props.availableInstanceTypesList.map((instanceType) => {
    return { label: instanceType, value: instanceType };
  });

  return (
    <Select
      clearable={false}
      multi={false}
      placeholder={'Select an instance type to add...'}
      removeSelected={true}
      searchable={true}
      options={instanceTypeListOptions}
      onChange={(o: Option<string>) => props.addOrUpdateInstanceType(o.value, undefined)}
    />
  );
};
