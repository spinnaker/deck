import { groupBy } from 'lodash';
import { DateTime } from 'luxon';

import { ManagedWriter, showModal, useApplicationContext } from 'core/index';
import { timeDiffToString } from 'core/utils';

import { MarkAsBadActionModal, PinActionModal, UnpinActionModal } from './ActionModal';
import { VersionAction } from './VersionMetadata';
import { actionStatusUtils } from './VersionOperation';
import { useFetchApplicationLazyQuery } from '../../graphql/graphql-sdk';
import { QueryArtifactVersion, QueryConstraint, QueryLifecycleStep } from '../types';
import { DEFAULT_VERSION_STATUSES } from '../utils';

const ALL_CONSTRAINT_STATUSES: Array<QueryConstraint['status']> = ['PASS', 'FORCE_PASS', 'PENDING', 'FAIL'];

export const getConstraintsStatusSummary = (constraints: QueryConstraint[]) => {
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

  const byStatus = groupBy(constraints, (c) => c.status);
  const summary = ALL_CONSTRAINT_STATUSES.map((status) => {
    const constraintsOfStatus = byStatus[status];
    return constraintsOfStatus ? `${constraintsOfStatus.length} ${actionStatusUtils[status].displayName}` : undefined;
  })
    .filter(Boolean)
    .join(', ');

  return { text: summary, status: finalStatus };
};

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

export const getLifecycleEventLink = (version: QueryArtifactVersion | undefined, type: QueryLifecycleStep['type']) => {
  return version?.lifecycleSteps?.find((step) => step.type === type)?.link;
};

const MODAL_MAX_WIDTH = 750;

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
  isPinned: boolean;
}): VersionAction[] | undefined => {
  const application = useApplicationContext();
  if (!application) throw new Error('Application context is empty');
  const [refetch] = useFetchApplicationLazyQuery({
    variables: { appName: application.name, statuses: DEFAULT_VERSION_STATUSES },
    fetchPolicy: 'network-only',
  });
  const actions: VersionAction[] = [
    isPinned
      ? {
          content: 'Unpin version',
          onClick: () => {
            showModal(
              UnpinActionModal,
              {
                application: application.name,
                environment,
                title: [`Unpin #${buildNumber}`, commitMessage].filter(Boolean).join(' - '),
                actionName: 'Unpin',
                onAction: () =>
                  ManagedWriter.unpinArtifactVersion({
                    application: application.name,
                    environment,
                    reference,
                  }),
                onSuccess: refetch,
                withComment: false,
              },
              { maxWidth: MODAL_MAX_WIDTH },
            );
          },
        }
      : {
          content: 'Pin version',
          onClick: () => {
            showModal(
              PinActionModal,
              {
                application: application.name,
                title: [`Pin #${buildNumber}`, commitMessage].filter(Boolean).join(' - '),
                actionName: 'Pin',
                onAction: (comment: string) =>
                  ManagedWriter.pinArtifactVersion({
                    application: application.name,
                    environment,
                    reference,
                    comment,
                    version,
                  }),
                onSuccess: refetch,
              },
              { maxWidth: MODAL_MAX_WIDTH },
            );
          },
        },

    {
      content: 'Mark as bad',
      onClick: () => {
        if (!application) throw new Error('Application context is empty');
        showModal(
          MarkAsBadActionModal,
          {
            application: application.name,
            title: [`Mark as Bad #${buildNumber}`, commitMessage].filter(Boolean).join(' - '),
            actionName: 'Mark as Bad',
            onAction: (comment: string) =>
              ManagedWriter.markArtifactVersionAsBad({
                application: application.name,
                environment,
                reference,
                comment,
                version,
              }),
            onSuccess: refetch,
          },
          { maxWidth: MODAL_MAX_WIDTH },
        );
      },
    },
  ];

  return actions.length ? actions : undefined;
};