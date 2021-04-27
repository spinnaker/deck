import { sortBy } from 'lodash';
import React from 'react';

import { IconTooltip } from 'core/presentation';

import { GitLink } from './GitLink';
import { PendingVersion } from './PendingVersion';
import { VersionMetadata } from './VersionMetadata';
import { QueryArtifact, QueryArtifactVersion } from '../types';
import { getLifecycleEventDuration } from './utils';

import './Artifact.less';

const CurrentVersion = ({ data }: { data: QueryArtifactVersion }) => {
  const gitMetadata = data.gitMetadata;
  return (
    <div className="artifact-current-version">
      {gitMetadata ? <GitLink gitMetadata={gitMetadata} /> : <div>Build {data?.version}</div>}
      <VersionMetadata
        buildNumber={data.buildNumber}
        author={gitMetadata?.author}
        deployedAt={data.deployedAt}
        buildDuration={getLifecycleEventDuration(data, 'BUILD')}
      />
    </div>
  );
};

type RequiredKeys<T, K extends keyof T> = Exclude<T, K> & Required<Pick<T, K>>;

const hasCreatedAt = (version: QueryArtifactVersion): version is RequiredKeys<QueryArtifactVersion, 'createdAt'> => {
  return Boolean(version.createdAt);
};

const filterVersionNewerThanCurrent = (versions: QueryArtifact['versions'], currentVersion?: QueryArtifactVersion) => {
  if (!currentVersion?.deployedAt) {
    // Everything is newer than current
    return versions;
  }
  const currentVersionDeployedAt = new Date(currentVersion.deployedAt);
  const newerVersions = versions
    ?.filter(hasCreatedAt)
    ?.filter((version) => new Date(version.createdAt) > currentVersionDeployedAt);
  // Sort from newest to oldest
  return sortBy(newerVersions || [], (version) => -1 * new Date(version.createdAt).getTime());
};

export const Artifact = ({ artifact }: { artifact: QueryArtifact }) => {
  const currentVersion = artifact.versions?.find((version) => version.status === 'CURRENT');
  const newerVersions = filterVersionNewerThanCurrent(artifact.versions, currentVersion);
  return (
    <div className="Artifact environment-row-element">
      <div className="row-icon">
        <IconTooltip tooltip={`Artifact - ${artifact.type}`} name="artifact" color="primary-g1" />
      </div>
      <div className="row-details">
        <div className="row-title">{artifact.reference}</div>
        {currentVersion ? <CurrentVersion data={currentVersion} /> : <div>No version is deployed</div>}
        <div className="artifact-pending-versions">
          {newerVersions?.map((version) => (
            <PendingVersion key={version.version} data={version} />
          ))}
        </div>
      </div>
    </div>
  );
};
