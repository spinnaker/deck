import React from 'react';
import { useIsActive, useSrefActive } from '@uirouter/react';

import { NavItem } from './NavItem';
import { ApplicationDataSource } from '../service/applicationDataSource';
import { Application } from '../../application';

export interface INavRouteProps {
  dataSource: ApplicationDataSource;
  app: Application;
}

export const NavRoute = ({ app, dataSource }: INavRouteProps) => {
  const sref = useSrefActive(dataSource.sref, {}, 'active');
  const isActive = useIsActive(dataSource.activeState);

  // useSrefActive does not assign the active class is not assigned for some nested states and hyperlinks, so we use isActive too
  if (!sref.className && isActive) {
    sref.className = 'active';
  }

  return (
    <a {...sref}>
      <NavItem app={app} dataSource={dataSource} isActive={isActive} />
    </a>
  );
};
