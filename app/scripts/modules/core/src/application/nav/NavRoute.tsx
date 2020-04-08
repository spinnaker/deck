import React from 'react';
import { UIRouterContext } from '@uirouter/react-hybrid';
import { UISref, UISrefActive } from '@uirouter/react';

import { NavCategory } from './NavCategory';
import { ApplicationDataSource } from '../service/applicationDataSource';
import { Application } from '../application.model';

export interface INavRouteProps {
  category: ApplicationDataSource;
  isActive: boolean;
  app: Application;
}

@UIRouterContext
export class NavRoute extends React.Component<INavRouteProps> {
  public render() {
    const { app, category, isActive } = this.props;

    return (
      <UISrefActive class="active" key={category.key}>
        <UISref to={category.sref}>
          <a>
            <NavCategory app={app} category={category} isActive={isActive} />
          </a>
        </UISref>
      </UISrefActive>
    );
  }
}
