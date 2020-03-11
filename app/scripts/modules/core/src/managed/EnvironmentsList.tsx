import React from 'react';
import { IManagedEnviromentSummary, IManagedResourceSummary, IManagedArtifactSummary } from '..';
import { ISelectedArtifact } from './Environments';
import { ObjectRow, NoticeCard } from 'core/presentation';

interface IEnvironmentsListProps {
  environments: IManagedEnviromentSummary[];
  resources: IManagedResourceSummary[];
  artifacts: IManagedArtifactSummary[];
  selectedArtifact: ISelectedArtifact;
}

const icons = {
  'titus/cluster@v1': 'cluster',
};

export function EnvironmentsList({ environments, resources, artifacts, selectedArtifact }: IEnvironmentsListProps) {
  const resourcesMap = resources.reduce((map, r) => {
    r.moniker = r.moniker ?? {};
    map[r.id] = r;
    return map;
  }, {} as { [key: string]: IManagedResourceSummary });

  return (
    <div>
      <NoticeCard
        icon="search"
        text={undefined}
        title={
          selectedArtifact
            ? `Showing ${selectedArtifact.name} ${selectedArtifact.version}`
            : `${artifacts.length} artifacts is deployed in 2 environments with no issues detected.`
        }
        isActive={true}
        noticeType={'ok'}
      />
      {environments.map(({ name, resources }) => (
        <div key={name.toUpperCase()}>
          <h3>{name}</h3>
          {resources
            .map(resourceId => resourcesMap[resourceId])
            .map(({ id, kind, artifact, moniker: { app, stack, detail } }) => (
              <ObjectRow
                key={id}
                icon={icons[kind] || 'cluster'}
                title={`${[app, stack, detail].filter(Boolean).join('-')} ${artifact?.versions?.current ||
                  'unknown version'}`}
              />
            ))}
          {/* <pre>
              {resources
                .map(resourceId => resourcesMap[resourceId])
                .map(
                  ({ kind, artifact, moniker: { app, stack, detail } }) =>
                    ` [${kind}] ${[app, stack, detail].filter(Boolean).join('-')} ${artifact?.versions?.current ||
                      'unknown version'}`,
                )
                .join('\n')}
            </pre> */}
        </div>
      ))}
      {/* {debug && <pre>{JSON.stringify(resourcesMap, null, 4)}</pre>} */}
    </div>
  );
}
