import { DateTime } from 'luxon';

import { timeDiffToString } from 'core/utils';

import { QueryArtifactVersion, QueryLifecycleStep } from '../types';

export const getLifecycleEventDuration = (
  version: QueryArtifactVersion | undefined,
  type: QueryLifecycleStep['type'],
) => {
  const event = version?.lifecycleSteps?.find((step) => step.type === type);
  if (!event) return undefined;
  const { startedAt, completedAt } = event;
  if (startedAt && completedAt) {
    return timeDiffToString(DateTime.fromISO(startedAt), DateTime.fromISO(completedAt));
  }
  return undefined;
};
