import React from 'react';
import { HelpField } from '@spinnaker/core';

export function NonCustomHeading(props: { profileLabel: string; profileDescriptionArr: string[] }) {
  return (
    <div className={'row sub-section'}>
      <h4>Instance Types</h4>
      <div className={'description'}>
        <p>
          <b>{props.profileLabel}</b>
        </p>
        <ul>
          {props.profileDescriptionArr.map((d, index) => (
            <li key={index}>{d}</li>
          ))}
        </ul>
        <i>
          <b>Note:</b> The order of instance types sets their priority when On-Demand capacity is launched; instance
          type at the top is prioritized the highest.
        </i>
      </div>
    </div>
  );
}

export function NonCustomTableHeader(props: { showCpuCredits: boolean }) {
  return (
    <thead>
      <tr>
        <th />
        <th></th>
        <th>InstanceType</th>
        <th>vCPU</th>
        <th>Mem (GiB)</th>
        {props.showCpuCredits && <th>CPU Credits</th>}
        <th>
          Storage (GB)
          <HelpField id={'aws.serverGroup.storageType'} />
        </th>
        <th>Cost</th>
        <th>
          Weight <HelpField id={'aws.serverGroup.instanceTypeWeight'} />
        </th>
      </tr>
    </thead>
  );
}
