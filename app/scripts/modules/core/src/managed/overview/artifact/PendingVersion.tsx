import { DateTime } from 'luxon';
import React from 'react';

import { GitLink } from './GitLink';
import { RelativeTimestamp } from '../../RelativeTimestamp';
import { VersionMetadata } from './VersionMetadata';
import { constraintsManager } from '../../constraints/registry';
import { QueryArtifactVersion, QueryConstraints } from '../types';
import { getLifecycleEventDuration } from './utils';

const constraintStatusToIcon: { [key in QueryConstraints['status']]: { color?: string; icon: string } } = {
  FAIL: { color: 'var(--color-status-error)', icon: 'far fa-times' },
  NOT_EVALUATED: { icon: 'far fa-hourglass' },
  OVERRIDE_FAIL: { color: 'var(--color-status-warning)', icon: 'far fa-times' },
  OVERRIDE_PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check' },
  PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check' },
  PENDING: { icon: 'far fa-hourglass' },
};

export const PendingVersion = ({ data }: { data: QueryArtifactVersion }) => {
  const { buildNumber, gitMetadata, constraints } = data;
  return (
    <div className="artifact-pending-version">
      {data.createdAt && (
        <div className="artifact-pending-version-timestamp">
          <RelativeTimestamp timestamp={DateTime.fromISO(data.createdAt)} />
        </div>
      )}
      <div className="artifact-pending-version-commit">
        <span>Processing </span>
        {gitMetadata ? <GitLink gitMetadata={gitMetadata} /> : `Build ${buildNumber}`}
      </div>
      <VersionMetadata
        buildNumber={buildNumber}
        author={gitMetadata?.author}
        buildDuration={getLifecycleEventDuration(data, 'BUILD')}
      />
      <div className="pending-version-constraints">
        {constraints?.map((constraint, index) => (
          <div key={index} className="pending-version-constraint">
            <i
              className={constraintStatusToIcon[constraint.status].icon}
              style={{ color: constraintStatusToIcon[constraint.status].color || 'var(--color-titanium)' }}
            />{' '}
            {constraintsManager.renderTitle(constraint)}
          </div>
        ))}
      </div>
    </div>
  );
};
