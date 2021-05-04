import React from 'react';

import { Application, CollapsibleSection, ICollapsibleSectionProps, Spinner } from 'core/index';

import { Resource } from './Resource';
import { Artifact } from './artifact/Artifact';
import { useFetchApplicationQuery } from '../graphql/graphql-sdk';
import { QueryEnvironment } from './types';

import './EnvironmentsOverview.less';
import './baseStyles.less';

interface IEnvironmentsProps {
  app: Application;
}

export const EnvironmentsOverview = ({ app }: IEnvironmentsProps) => {
  const { data, error, loading } = useFetchApplicationQuery({ variables: { appName: app.name } });

  if (loading && !data) {
    return (
      <div style={{ width: '100%' }}>
        <Spinner size="medium" message="Loading environments ..." />
      </div>
    );
  }

  if (error) {
    console.warn(error);
    return <div style={{ width: '100%' }}>Failed to load environments data, please refresh and try again.</div>;
  }

  return (
    <div className="EnvironmentOverview">
      {data?.application?.environments.map((env) => (
        <Environment key={env.name} environment={env} />
      ))}
    </div>
  );
};

const sectionProps: Partial<ICollapsibleSectionProps> = {
  outerDivClassName: 'environment-section',
  headingClassName: 'environment-section-heading',
  useGlyphiconChevron: false,
};

const Environment = ({ environment }: { environment: QueryEnvironment }) => {
  const state = environment.state;
  return (
    <section className="Environment">
      <EnvironmentTitle title={environment.name} />
      <CollapsibleSection heading="Artifacts" {...sectionProps} defaultExpanded>
        {state.artifacts?.map((artifact) => (
          <Artifact key={artifact.reference} artifact={artifact} />
        ))}
      </CollapsibleSection>
      <CollapsibleSection heading="Resources" {...sectionProps}>
        {state.resources?.map((resource) => (
          <Resource key={resource.id} resource={resource} environment={environment.name} />
        ))}
      </CollapsibleSection>
    </section>
  );
};

const EnvironmentTitle = ({ title }: { title: string }) => {
  return <div className="EnvironmentTitle">{title}</div>;
};
