import { DateTime } from 'luxon';

import { showModal, useApplicationContext } from 'core/index';
import { timeDiffToString } from 'core/utils';

import { ArtifactActionModal } from './ActionModal';
import { VersionAction } from './VersionMetadata';
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

export const useCreateVersionActions = ({
  environment,
  reference,
  version,
  buildNumber,
  commitMessage,
  isPinned,
}: {
  environment: string;
  reference: string;
  version: string;
  buildNumber?: string;
  commitMessage?: string;
  isPinned?: boolean;
}): VersionAction[] | undefined => {
  const application = useApplicationContext();
  const actions: VersionAction[] = [];
  if (!isPinned) {
    actions.push({
      content: 'Pin version',
      onClick: () => {
        if (!application) throw new Error('Application context is empty');
        showModal(
          ArtifactActionModal,
          {
            application: application.name,
            environment,
            reference,
            title: [`Pin #${buildNumber}`, commitMessage].filter(Boolean).join(' - '),
            version,
          },
          { maxWidth: 750 },
        );
      },
    });
  }
  return actions.length ? actions : undefined;
};
