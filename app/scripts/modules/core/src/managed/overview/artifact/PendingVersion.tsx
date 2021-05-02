import { groupBy } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';

import { GitLink } from './GitLink';
import { RelativeTimestamp } from '../../RelativeTimestamp';
import { PinData, VersionMetadata } from './VersionMetadata';
import { constraintsManager } from '../../constraints/registry';
import { QueryArtifactVersion, QueryConstraint } from '../types';
import { getLifecycleEventDuration, useCreateVersionActions } from './utils';
import { TOOLTIP_DELAY } from '../../utils/defaults';

const constraintStatusUtils: {
  [key in QueryConstraint['status']]: { color?: string; icon: string; displayName: string };
} = {
  FAIL: { color: 'var(--color-status-error)', icon: 'far fa-times', displayName: 'failed' },
  FORCE_PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check', displayName: 'overridden' },
  PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check', displayName: 'passed' },
  PENDING: { icon: 'far fa-hourglass', displayName: 'pending' },
};

const getStatusSummary = (constraints: QueryConstraint[]) => {
  const byStatus = groupBy(constraints, (c) => c.status);
  const summary = Object.entries(byStatus)
    .map(
      ([status, value]) => `${value.length} ${constraintStatusUtils[status as QueryConstraint['status']].displayName}`,
    )
    .join(', ');
  let finalStatus: QueryConstraint['status'] = 'PASS';
  for (const { status } of constraints) {
    if (status === 'FAIL') {
      finalStatus = 'FAIL';
      break;
    } else if (status === 'PENDING') {
      finalStatus = 'PENDING';
    } else if (status === 'FORCE_PASS' && finalStatus !== 'PENDING') {
      finalStatus = 'FORCE_PASS';
    }
  }
  return { text: summary, status: finalStatus };
};

const ConstraintIcon = ({ status }: { status: QueryConstraint['status'] }) => {
  return (
    <i
      className={constraintStatusUtils[status].icon}
      style={{ color: constraintStatusUtils[status].color || 'var(--color-titanium)' }}
    />
  );
};

const Constraints = ({ constraints }: { constraints: NonNullable<QueryArtifactVersion['constraints']> }) => {
  const [isExpanded, setIsExpanded] = React.useState(constraints.length <= 1);
  const summary = getStatusSummary(constraints);
  return (
    <div className="pending-version-constraints">
      {isExpanded ? (
        constraints?.map((constraint, index) => (
          <div key={index} className="pending-version-constraint">
            <ConstraintIcon status={constraint.status} />
            {constraintsManager.renderTitle(constraint)}
          </div>
        ))
      ) : (
        <div className="pending-version-constraint">
          <ConstraintIcon status={summary.status} />
          <span>
            <span className="pending-version-constraint-title">Constraints</span>: {summary.text}{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsExpanded(true);
              }}
            >
              (expand)
            </a>
          </span>
        </div>
      )}
    </div>
  );
};

export const PendingVersion = ({
  data,
  reference,
  environment,
  pinData,
}: {
  data: QueryArtifactVersion;
  reference: string;
  environment: string;
  pinData?: PinData;
}) => {
  const { buildNumber, version, gitMetadata, constraints, status } = data;
  const actions = useCreateVersionActions({
    environment,
    reference,
    buildNumber,
    version,
    commitMessage: gitMetadata?.commitInfo?.message,
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
        pinData={pinData}
        actions={actions}
      />
      {constraints && <Constraints constraints={constraints} />}
    </div>
  );
};
