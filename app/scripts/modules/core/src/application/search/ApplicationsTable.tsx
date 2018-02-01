import * as React from 'react';
import { UISref } from '@uirouter/react';

import { timestamp } from 'core/utils';
import { IApplicationSummary } from 'core/application';

import { ColHeader } from './ColHeader';

export interface IApplicationTableProps {
  applications: IApplicationSummary[];
  currentSort: string;
  toggleSort: (column: string) => void;
}

export const ApplicationTable = ({ currentSort, toggleSort, applications }: IApplicationTableProps) => (
  <table className="table table-hover">
    <thead>
    <tr>
      <ColHeader toggleSort={toggleSort} currentSort={currentSort} width="18%" label="Name" column="name"/>
      <ColHeader toggleSort={toggleSort} currentSort={currentSort} width="15%" label="Created" column="createTs"/>
      <ColHeader toggleSort={toggleSort} currentSort={currentSort} width="15%" label="Updated" column="updateTs"/>
      <ColHeader toggleSort={toggleSort} currentSort={currentSort} width="15%" label="Owner" column="email"/>
      <ColHeader toggleSort={toggleSort} currentSort={currentSort} label="Account(s)" column="accounts"/>
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
