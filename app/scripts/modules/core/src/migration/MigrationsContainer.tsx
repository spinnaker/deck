import React from 'react';
import { useCurrentStateAndParams } from '@uirouter/react';

import { Overridable } from 'core/overrideRegistry';
import { SETTINGS } from 'core';

import './MigrationsContainer.less';

export interface IMigrationBannerProps {
  details: string;
  title: string;
}

export const MigrationBanner = ({ details, title }: IMigrationBannerProps) => (
  <div className="MigrationBanner">
    <h4>{title}</h4>
    <p>{details}</p>
  </div>
);

@Overridable('core.insight.migrations')
export class MigrationsContainer extends React.Component<{}> {
  public render(): React.ReactElement<MigrationsContainer> {
    return <MigrationsContainerContent />;
  }
}

export const MigrationsContainerContent = () => {
  const { state: currentState } = useCurrentStateAndParams();
  const migrations = (SETTINGS.migrations || []).filter((m) => {
    const validRoute = m.routes.some((route) => currentState.name.includes(route));
    return m.active && validRoute;
  });
  // eslint-disable-next-line
  console.log({ migrations });
  if (!migrations.length) {
    return null;
  }

  return (
    <div className="MigrationsContainer sp-margin-sm vertical">
      {migrations.map((m) => (
        <MigrationBanner key={`migration-${m.title}`} details={m.details} title={m.title} />
      ))}
    </div>
  );
};
