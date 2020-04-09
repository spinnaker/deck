import React from 'react';
import { UIRouterContextComponent } from '@uirouter/react-hybrid';
import { UISref } from '@uirouter/react';

import { NavCategory } from './NavCategory';
import { ApplicationDataSource } from '../service/applicationDataSource';
import { Application } from '../../application';

export interface INavRouteProps {
  category: ApplicationDataSource;
  isActive: boolean;
  app: Application;
}

export const NavRoute = ({ app, category, isActive }: INavRouteProps) => (
  <UIRouterContextComponent key={category.key}>
    <UISref to={category.sref}>
      <a>
        <NavCategory app={app} category={category} isActive={isActive} />
      </a>
    </UISref>
  </UIRouterContextComponent>
);
