import * as React from 'react';
import { UISref } from '@uirouter/react';

import { timestamp } from 'core/utils';
import { IApplicationSummary } from 'core/application';
import { SortToggle } from 'core/presentation';

export interface IApplicationTableProps {
  applications: IApplicationSummary[];
  currentSort: string;
  toggleSort: (column: string) => void;
}

export const ApplicationTable = ({ currentSort, toggleSort, applications }: IApplicationTableProps) => (
  <table className="table table-hover">
    <thead>
      <tr>
        <th style={{ width: '18%' }}><SortToggle sortKey={currentSort} onChange={toggleSort} label="Name" currentSort="name"/></th>
        <th style={{ width: '15%' }}><SortToggle sortKey={currentSort} onChange={toggleSort} label="Created" currentSort="createTs"/></th>
        <th style={{ width: '15%' }}><SortToggle sortKey={currentSort} onChange={toggleSort} label="Updated" currentSort="updateTs"/></th>
        <th style={{ width: '15%' }}><SortToggle sortKey={currentSort} onChange={toggleSort} label="Owner" currentSort="email"/></th>
        <th><SortToggle sortKey={currentSort} onChange={toggleSort} label="Account(s)" currentSort="accounts"/></th>
        <th style={{ width: '22%' }}>Description</th>
      </tr>
    </thead>

    <tbody>
    {applications.map(app => {
      const appName = app.name.toLowerCase();

      return (
        <UISref key={appName} to=".application.insight.clusters" params={{ application: appName }}>
          <tr className="clickable">
            <td>
              <UISref to=".application.insight.clusters" params={{ application: appName }}>
                <a>{appName}</a>
              </UISref>
            </td>
            <td>{timestamp(app.createTs)}</td>
            <td>{timestamp(app.updateTs)}</td>
            <td>{app.email}</td>
            <td>{app.accounts}</td>
            <td>{app.description}</td>
          </tr>
        </UISref>
      );
    })}
    </tbody>
  </table>
);
