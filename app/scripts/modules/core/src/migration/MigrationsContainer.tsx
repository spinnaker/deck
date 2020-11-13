import React from 'react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { UIRouterContextComponent } from '@uirouter/react-hybrid';

import { Overridable } from 'core/overrideRegistry';
import { SETTINGS } from 'core';
import { Application } from 'core/application';
import './MigrationsContainer.less';

export interface IMigrationBannerProps {
  details: string;
  title: string;
}

export const MigrationBanner = ({ details, title }: IMigrationBannerProps) => (
  <div className="MigrationBanner">
    <div className="horizontal middle">
      <i className="fa fa-exclamation-triangle sp-margin-s-right" />
      <h4>
        <b>{title}</b>
      </h4>
    </div>
    <p>{details}</p>
  </div>
);

export interface IMigrationsContainerProps {
  app?: Application;
}

@Overridable('core.insight.migrations')
export class MigrationsContainer extends React.Component<IMigrationsContainerProps> {
  public render(): React.ReactElement<MigrationsContainer> {
    return (
      <UIRouterContextComponent>
        <MigrationsContainerContent />
      </UIRouterContextComponent>
    );
  }
}

export const MigrationsContainerContent = () => {
  const { state: currentState } = useCurrentStateAndParams();
  const migrations = (SETTINGS.migrations || []).filter((m) => {
    const validRoute = m.routes.some((route) => currentState.name.includes(route));
    return m.active && validRoute;
  });

  if (!migrations.length) {
    return null;
  }

  return (
    <div className="MigrationsContainer sp-margin-sm vertical">
      {migrations.map((m) => (
        <MigrationBanner key={`migration-${m.key}`} details={m.details} title={m.title || m.key} />
      ))}
    </div>
  );
};
