import { DateTime } from 'luxon';
import React from 'react';

import { Constraints } from './Constraints';
import { GitLink } from './GitLink';
import { RelativeTimestamp } from '../../RelativeTimestamp';
import { VersionMetadata } from './VersionMetadata';
import { QueryArtifactVersion } from '../types';
import { getLifecycleEventDuration, useCreateVersionActions } from './utils';
import { TOOLTIP_DELAY } from '../../utils/defaults';

export const PendingVersion = ({
  data,
  reference,
  environment,
  isPinned,
}: {
  data: QueryArtifactVersion;
  reference: string;
  environment: string;
  isPinned: boolean;
}) => {
  const { buildNumber, version, gitMetadata, constraints, status } = data;
  const actions = useCreateVersionActions({
    environment,
    reference,
    buildNumber,
    version,
    commitMessage: gitMetadata?.commitInfo?.message,
    isPinned,
  });

  return (
    <div className="artifact-pending-version">
      {data.createdAt && (
        <div className="artifact-pending-version-timestamp">
          <RelativeTimestamp timestamp={DateTime.fromISO(data.createdAt)} delayShow={TOOLTIP_DELAY} />
        </div>
      )}
      <div className="artifact-pending-version-commit">
        {gitMetadata ? <GitLink gitMetadata={gitMetadata} /> : `Build ${buildNumber}`}
      </div>
      <VersionMetadata
        buildNumber={buildNumber}
        author={gitMetadata?.author}
        buildDuration={getLifecycleEventDuration(data, 'BUILD')}
        isDeploying={status === 'DEPLOYING'}
        isPinned={isPinned}
        actions={actions}
      />
      {constraints && (
        <Constraints constraints={constraints} versionProps={{ environment, reference, version: data.version }} />
      )}
    </div>
  );
};
