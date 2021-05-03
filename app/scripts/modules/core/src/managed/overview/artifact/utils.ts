import { DateTime } from 'luxon';

import { ManagedWriter, showModal, useApplicationContext } from 'core/index';
import { timeDiffToString } from 'core/utils';

import { MarkAsBadActionModal, PinActionModal, UnpinActionModal } from './ActionModal';
import { VersionAction } from './VersionMetadata';
import { useFetchApplicationLazyQuery } from '../../graphql/graphql-sdk';
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
    variables: { appName: application.name },
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
