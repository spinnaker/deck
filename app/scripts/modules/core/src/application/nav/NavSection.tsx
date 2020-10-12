import React from 'react';
import { NavRoute } from './NavRoute';

import { ApplicationDataSource } from '../service/applicationDataSource';
import { Application } from '../application.model';

export interface INavigationSectionProps {
  dataSources: ApplicationDataSource[];
  app: Application;
}

export const NavSection = ({ app, dataSources }: INavigationSectionProps) => (
  <div className="nav-section sp-padding-s-yaxis text-semibold">
    {dataSources.map((dataSource) => (
      <NavRoute key={dataSource.label} dataSource={dataSource} app={app} />
    ))}
  </div>
);
