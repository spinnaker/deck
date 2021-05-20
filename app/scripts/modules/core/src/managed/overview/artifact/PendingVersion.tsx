import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';

import { Constraints } from './Constraints';
import { GitLink } from './GitLink';
import { RelativeTimestamp } from '../../RelativeTimestamp';
import { QueryArtifactVersion } from '../types';
import { useCreateVersionActions } from './utils';
import { TOOLTIP_DELAY_SHOW } from '../../utils/defaults';
import { getBaseMetadata, VersionMetadata } from '../../versionMetadata/VersionMetadata';

interface IPendingVersionProps {
  data: QueryArtifactVersion;
  reference: string;
  environment: string;
  isPinned: boolean;
  index: number;
}

export const PendingVersion = ({ data, reference, environment, isPinned, index }: IPendingVersionProps) => {
  const { buildNumber, version, gitMetadata, constraints } = data;
  const actions = useCreateVersionActions({
    environment,
    reference,
    buildNumber,
    version,
    commitMessage: gitMetadata?.commitInfo?.message,
    isPinned,
    compareLinks: {
      current: gitMetadata?.comparisonLinks?.toCurrentVersion,
    },
  });

  return (
    <div className="artifact-pending-version">
      {data.createdAt && (
        <div className="artifact-pending-version-timestamp">
          <RelativeTimestamp timestamp={DateTime.fromISO(data.createdAt)} delayShow={TOOLTIP_DELAY_SHOW} />
        </div>
      )}
      <div className="artifact-pending-version-commit">
        {gitMetadata ? <GitLink gitMetadata={gitMetadata} /> : `Build ${buildNumber}`}
      </div>
      <VersionMetadata {...getBaseMetadata(data)} isPinned={isPinned} actions={actions} />
      {constraints && !isEmpty(constraints) && (
        <Constraints
          key={index} // This is needed on refresh if a new version was added
          constraints={constraints}
          versionProps={{ environment, reference, version: data.version }}
          expandedByDefault={index === 0}
        />
      )}
    </div>
  );
};
