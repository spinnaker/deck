import React from 'react';

import { Application } from 'core/index';

import { Artifact } from './Artifact/Artifact';
import { CollapsibleSection } from './CollapsibleSection';
import { Resource } from './Resource';
import { useFetchApplicationQuery } from '../graphql/graphql-sdk';
import { QueryEnvironment } from './types';

import './EnvironmentsOverview.less';
import './baseStyles.less';

interface IEnvironmentsProps {
  app: Application;
}

export const EnvironmentsOverview = ({ app }: IEnvironmentsProps) => {
  const { data, error } = useFetchApplicationQuery({ variables: { appName: app.name } });
  if (error) {
    // TODO: notify users
    console.warn(error);
  }

  return (
    <div className="EnvironmentOverview">
      {data?.application?.environments.map((env) => (
        <Environment key={env.name} environment={env} />
      ))}
    </div>
  );
};

const Environment = ({ environment }: { environment: QueryEnvironment }) => {
  const state = environment.state;
  return (
    <section className="Environment">
      <EnvironmentTitle title={environment.name} />
      <CollapsibleSection title="Artifacts" expandedByDefault>
        {state.artifacts?.map((artifact) => (
          <Artifact key={artifact.reference} artifact={artifact} />
        ))}
      </CollapsibleSection>
      <CollapsibleSection title="Resources">
        {state.resources?.map((resource) => (
          <Resource key={resource.id} resource={resource} />
        ))}
      </CollapsibleSection>
    </section>
  );
};

const EnvironmentTitle = ({ title }: { title: string }) => {
  return <div className="EnvironmentTitle">{title}</div>;
};
