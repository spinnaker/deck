import React from 'react';

import { NoticeCard } from '../presentation/layout/NoticeCard';
import { ObjectRow } from '../presentation/layout/ObjectRow';
import { IManagedEnviromentSummary, IManagedResourceSummary, IManagedArtifactSummary } from '../domain/IManagedEntity';
import { ISelectedArtifact } from './Environments';

interface IEnvironmentsListProps {
  environments: IManagedEnviromentSummary[];
  resources: IManagedResourceSummary[];
  artifacts: IManagedArtifactSummary[];
  selectedArtifact: ISelectedArtifact;
}

function getIconTypeFromKind(kind: string) {
  if (kind === 'titus/cluster@v1') {
    return 'cluster';
  }
  // default for now
  return 'cluster';
}

function shouldDisplayResource(resource: IManagedResourceSummary) {
  //TODO: naively filter on presence of moniker but how should we really decide what to display?
  return !!resource.moniker;
}

export function EnvironmentsList({ environments, resources, artifacts, selectedArtifact }: IEnvironmentsListProps) {
  const resourcesMap: { [key: string]: IManagedResourceSummary } = resources.reduce((map, r) => {
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
        <div key={name}>
          <h3>{name.toUpperCase()}</h3>
          {resources
            .map(resourceId => resourcesMap[resourceId])
            .filter(shouldDisplayResource)
            .map(({ id, kind, artifact, moniker: { app, stack, detail } }: IManagedResourceSummary) => (
              <ObjectRow
                key={id}
                icon={getIconTypeFromKind(kind)}
                title={`${[app, stack, detail].filter(Boolean).join('-')} ${artifact?.versions?.current ||
                  'unknown version'}`}
              />
            ))}
        </div>
      ))}
    </div>
  );
}
