import React from 'react';

import { CollapsibleSection, ICollapsibleSectionProps, useApplicationContextSafe } from 'core/presentation';

import { Resource } from './Resource';
import { Artifact } from './artifact/Artifact';
import { BaseEnvironment } from '../environmentBaseElements/BaseEnvironment';
import { useFetchResourceStatusQuery } from '../graphql/graphql-sdk';
import { QueryEnvironment } from './types';

const sectionProps: Partial<ICollapsibleSectionProps> = {
  outerDivClassName: 'environment-section',
  headingClassName: 'environment-section-heading',
  bodyClassName: 'environment-section-body',
};

interface IEnvironmentProps {
  environment: QueryEnvironment;
}

export const EnvironmentOverview = ({ environment }: IEnvironmentProps) => {
  const app = useApplicationContextSafe();
  const { data } = useFetchResourceStatusQuery({ variables: { appName: app.name } });
  const resources = data?.application?.environments.find((env) => env.name === environment.name)?.state.resources;
  const hasResourcesWithIssues = resources?.some((resource) => resource.state?.status !== 'UP_TO_DATE');
  const state = environment.state;
  return (
    <BaseEnvironment title={environment.name}>
      <CollapsibleSection heading="Artifacts" {...sectionProps} defaultExpanded enableCaching={false}>
        {state.artifacts?.length ? (
          state.artifacts.map((artifact) => <Artifact key={artifact.reference} artifact={artifact} />)
        ) : (
          <ErrorMessage>No artifacts found</ErrorMessage>
        )}
      </CollapsibleSection>
      <CollapsibleSection
        heading="Resources"
        key={`resources-section-${Boolean(data)}`} // This is used remount the section for defaultExpanded to work
        {...sectionProps}
        enableCaching={false}
        defaultExpanded={hasResourcesWithIssues}
      >
        {state.resources?.length ? (
          state.resources.map((resource) => (
            <Resource key={resource.id} resource={resource} environment={environment.name} />
          ))
        ) : (
          <ErrorMessage>No resources found</ErrorMessage>
        )}
      </CollapsibleSection>
    </BaseEnvironment>
  );
};

const ErrorMessage: React.FC = ({ children }) => (
  <div className="environment-row-element">
    <div className="error-message">{children}</div>
  </div>
);
