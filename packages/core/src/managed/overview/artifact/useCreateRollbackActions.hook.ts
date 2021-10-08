import type { IVersionActionsProps, IVersionRelativeAgeToCurrent } from './ArtifactActionModal';
import type { VersionAction } from '../../artifactActions/ArtifactActions';
import type { FetchCurrentVersionQuery } from '../../graphql/graphql-sdk';
import { useFetchCurrentVersionQuery } from '../../graphql/graphql-sdk';
import { useMarkVersionAsBad, useMarkVersionAsGood, usePinVersion, useUnpinVersion } from './hooks';
import { useApplicationContextSafe } from '../../../presentation';

const useGetCurrentVersion = (environment: string, reference: string) => {
  const application = useApplicationContextSafe();
  const { data: currentVersionData } = useFetchCurrentVersionQuery({ variables: { appName: application.name } });
  const currentVersion = currentVersionData?.application?.environments
    .find((e) => e.name === environment)
    ?.state.artifacts?.find((artifact) => artifact.reference === reference)?.versions?.[0];
  return currentVersion;
};

type ICurrentVersion = NonNullable<
  NonNullable<
    NonNullable<FetchCurrentVersionQuery['application']>['environments'][number]['state']['artifacts']
  >[number]['versions']
>[number];

const rollbackText: { [key in IVersionRelativeAgeToCurrent]: string } = {
  CURRENT: 'Pin version...',
  NEWER: 'Roll forward to...',
  OLDER: 'Roll back to...',
};

const getRelativeAgeToCurrent = ({
  isCurrent,
  createdAt,
  currentVersion,
}: {
  isCurrent?: boolean;
  createdAt?: string;
  currentVersion?: ICurrentVersion;
}): IVersionRelativeAgeToCurrent => {
  if (isCurrent) return 'CURRENT';
  if (
    !createdAt ||
    !currentVersion?.createdAt ||
    new Date(createdAt).getTime() < new Date(currentVersion.createdAt).getTime()
  )
    return 'OLDER';
  return 'NEWER';
};

export const useCreateVersionRollbackActions = (
  props: Omit<IVersionActionsProps, 'application'>,
): VersionAction[] | undefined => {
  const application = useApplicationContextSafe();

  const { environment, reference, isPinned, isVetoed, isCurrent, selectedVersion } = props;

  const currentVersion = useGetCurrentVersion(environment, reference);
  const relativeAgeToCurrent = getRelativeAgeToCurrent({
    isCurrent,
    createdAt: selectedVersion.createdAt,
    currentVersion,
  });

  const basePayload: IVersionActionsProps = { application: application.name, ...props };

  const onUnpin = useUnpinVersion(basePayload);

  const onPin = usePinVersion(basePayload, relativeAgeToCurrent);

  const onMarkAsBad = useMarkVersionAsBad(basePayload);

  const onMarkAsGood = useMarkVersionAsGood(basePayload);

  const actions: VersionAction[] = [
    isPinned
      ? {
          content: 'Unpin version...',
          onClick: onUnpin,
        }
      : {
          content: rollbackText[relativeAgeToCurrent],
          onClick: onPin,
        },
  ];

  if (isVetoed) {
    actions.push({
      content: 'Allow deploying...',
      onClick: onMarkAsGood,
    });
  } else {
    if (!isCurrent) {
      actions.push({
        content: isCurrent ? 'Rollback...' : 'Reject...',
        onClick: onMarkAsBad,
      });
    }
  }

  return actions;
};
