import React from 'react';
import { HelpField } from '@spinnaker/core';

export function CustomHeading() {
  return (
    <div className={'row sub-section text'}>
      <h4>Instance Types</h4>
      <div className={'description'}>
        <p>Choose the instance types that best suit the needs of your application.</p>
        <i>
          <b>Note:</b>
          <ul>
            <li>
              The order of instance types sets their priority when On-Demand capacity is launched; instance type at the
              top is prioritized the highest.
            </li>
            <li>Some instance types might not be available for the selected configuration.</li>
          </ul>
        </i>
      </div>
    </div>
  );
}

export function CustomTableHeader() {
  return (
    <thead>
      <tr>
        <th />
        <th>
          Instance Type <HelpField id="aws.serverGroup.instanceTypes" />
        </th>
        <th>
          Weight <HelpField id="aws.serverGroup.instanceTypeWeight" />
        </th>
        <th />
      </tr>
    </thead>
  );
}
