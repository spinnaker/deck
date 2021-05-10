import React from 'react';

import { GitLink } from './GitLink';
import { Verifications } from './Verifications';
import { VersionMetadata } from './VersionMetadata';
import { QueryArtifactVersion } from '../types';
import { getLifecycleEventDuration, getLifecycleEventLink, useCreateVersionActions } from './utils';

export const CurrentVersion = ({
  data,
  environment,
  reference,
  numNewerVersions,
  isPinned,
}: {
  data: QueryArtifactVersion;
  environment: string;
  reference: string;
  numNewerVersions?: number;
  isPinned: boolean;
}) => {
  const { gitMetadata, verifications } = data;
  const actions = useCreateVersionActions({
    environment,
    reference,
    version: data.version,
    buildNumber: data.buildNumber,
    commitMessage: gitMetadata?.commitInfo?.message,
    isPinned,
    compareLinks: {
      previous: gitMetadata?.comparisonLinks?.toPreviousVersion,
    },
  });
  return (
    <div className="artifact-current-version">
      {gitMetadata ? <GitLink gitMetadata={gitMetadata} /> : <div>Build {data?.version}</div>}
      <VersionMetadata
        buildNumber={data.buildNumber}
        buildLink={getLifecycleEventLink(data, 'BUILD')}
        author={gitMetadata?.author}
        deployedAt={data.deployedAt}
        buildDuration={getLifecycleEventDuration(data, 'BUILD')}
        buildsBehind={numNewerVersions}
        actions={actions}
        isPinned={isPinned}
      />
      {verifications && <Verifications verifications={verifications} />}
    </div>
  );
};
