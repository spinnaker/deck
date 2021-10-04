import { groupBy } from 'lodash';
import { DateTime } from 'luxon';

import { ACTION_DISPLAY_NAMES, getActionStatusData } from './VersionOperation';
import type { VersionAction } from '../../artifactActionsMenu/ArtifactActionsMenu';
import type { MdArtifactStatusInEnvironment } from '../../graphql/graphql-sdk';
import { useMarkVersionAsBad, useMarkVersionAsGood, usePinVersion, useUnpinVersion } from './hooks';
import { useApplicationContextSafe } from '../../../presentation';
import type { QueryArtifactVersion, QueryConstraint, QueryLifecycleStep } from '../types';
import { timeDiffToString } from '../../../utils';

export const getConstraintsStatusSummary = (constraints: QueryConstraint[]) => {
  let finalStatus: QueryConstraint['status'] = 'PASS';
  for (const { status } of constraints) {
    if (status === 'FAIL') {
      finalStatus = 'FAIL';
      break;
    } else if (status === 'PENDING' || status === 'BLOCKED') {
      finalStatus = 'PENDING';
    } else if (status === 'FORCE_PASS' && finalStatus !== 'PENDING') {
      finalStatus = 'FORCE_PASS';
    }
  }

  const byStatus = groupBy(constraints, (c) => getActionStatusData(c.status)?.displayName || 'pending');
  const summary = ACTION_DISPLAY_NAMES.map((displayName) => {
    const constraintsOfStatus = byStatus[displayName];
    return constraintsOfStatus ? `${constraintsOfStatus.length} ${displayName}` : undefined;
  })
    .filter(Boolean)
    .join(', ');

  return { text: summary, status: finalStatus };
};

export const getLifecycleEventByType = (
  version: QueryArtifactVersion | undefined,
  type: QueryLifecycleStep['type'],
): QueryLifecycleStep | undefined => {
  return version?.lifecycleSteps?.find((step) => step.type === type);
};

export const getLifecycleEventDuration = (
  version: QueryArtifactVersion | undefined,
  type: QueryLifecycleStep['type'],
) => {
  const event = getLifecycleEventByType(version, type);
  if (!event) return undefined;
  const { startedAt, completedAt } = event;
  if (startedAt && completedAt) {
    return timeDiffToString(DateTime.fromISO(startedAt), DateTime.fromISO(completedAt));
  }
  return undefined;
};

export const getLifecycleEventLink = (version: QueryArtifactVersion | undefined, type: QueryLifecycleStep['type']) => {
  return getLifecycleEventByType(version, type)?.link;
};

export const isBaking = (version: QueryArtifactVersion) => {
  return getLifecycleEventByType(version, 'BAKE')?.status === 'RUNNING';
};

export interface LifecycleEventSummary {
  startedAt?: DateTime;
  duration?: string;
  link?: string;
  isRunning: boolean;
}

export const getLifecycleEventSummary = (
  version: QueryArtifactVersion | undefined,
  type: QueryLifecycleStep['type'],
): LifecycleEventSummary | undefined => {
  const event = getLifecycleEventByType(version, type);
  if (!event) return undefined;
  return {
    startedAt: event.startedAt ? DateTime.fromISO(event.startedAt) : undefined,
    duration: getLifecycleEventDuration(version, type),
    isRunning: event.status === 'RUNNING',
    link: event.link,
  };
};

interface ICreateVersionActionsProps {
  environment: string;
  reference: string;
  version: string;
  buildNumber?: string;
  commitMessage?: string;
  isPinned: boolean;
  status?: MdArtifactStatusInEnvironment;
  isCurrent?: boolean;
}

export const useCreateVersionRollbackActions = ({
  environment,
  reference,
  version,
  status,
  buildNumber,
  commitMessage,
  isPinned,
  isCurrent,
}: ICreateVersionActionsProps): VersionAction[] | undefined => {
  const application = useApplicationContextSafe();

  const basePayload = { application: application.name, environment, reference, version };

  const onUnpin = useUnpinVersion(basePayload, [`Unpin #${buildNumber}`, commitMessage].filter(Boolean).join(' - '));

  const onPin = usePinVersion(
    basePayload,
    [isCurrent ? `Pin #${buildNumber} as live` : `Roll back to #${buildNumber} and pin`, commitMessage]
      .filter(Boolean)
      .join(' - '),
  );

  const onMarkAsBad = useMarkVersionAsBad(
    basePayload,
    [isCurrent ? `Roll back to previous and never deploy` : 'Never deploy', ` #${buildNumber}`, commitMessage]
      .filter(Boolean)
      .join(' - '),
  );

  const onMarkAsGood = useMarkVersionAsGood(
    basePayload,
    [`Allow deploying #${buildNumber}`, commitMessage].filter(Boolean).join(' - '),
  );

  const actions: VersionAction[] = [
    isPinned
      ? {
          content: 'Unpin version...',
          onClick: onUnpin,
        }
      : {
          content: isCurrent ? 'Pin this version as deployed...' : 'Rollback to this version...',
          onClick: onPin,
        },
    status === 'VETOED'
      ? {
          content: 'Allow deploying this version...',
          onClick: onMarkAsGood,
        }
      : {
          content: isCurrent ? 'Rollback to previous version...' : 'Never deploy this version...',
          onClick: onMarkAsBad,
        },
  ];
  return actions.length ? actions : undefined;
};
