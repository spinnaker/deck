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
        <th style={{ width: '18%' }}><SortToggle model={{ key: currentSort }} onChange={toggleSort} label="Name" sortKey="name"/></th>
        <th style={{ width: '15%' }}><SortToggle model={{ key: currentSort }} onChange={toggleSort} label="Created" sortKey="createTs"/></th>
        <th style={{ width: '15%' }}><SortToggle model={{ key: currentSort }} onChange={toggleSort} label="Updated" sortKey="updateTs"/></th>
        <th style={{ width: '15%' }}><SortToggle model={{ key: currentSort }} onChange={toggleSort} label="Owner" sortKey="email"/></th>
        <th><SortToggle model={{ key: currentSort }} onChange={toggleSort} label="Account(s)" sortKey="accounts"/></th>
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
