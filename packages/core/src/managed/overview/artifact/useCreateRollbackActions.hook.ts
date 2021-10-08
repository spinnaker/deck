import type { IVersionActionsProps } from './ArtifactActionModal';
import type { VersionAction } from '../../artifactActions/ArtifactActions';
import { useMarkVersionAsBad, useMarkVersionAsGood, usePinVersion, useUnpinVersion } from './hooks';
import { useApplicationContextSafe } from '../../../presentation';

export const useCreateVersionRollbackActions = (
  props: Omit<IVersionActionsProps, 'application'>,
): VersionAction[] | undefined => {
  const application = useApplicationContextSafe();
  const { isPinned, isVetoed, isCurrent } = props;

  const basePayload: IVersionActionsProps = { application: application.name, ...props };

  const onUnpin = useUnpinVersion(basePayload);

  const onPin = usePinVersion(basePayload);

  const onMarkAsBad = useMarkVersionAsBad(basePayload);

  const onMarkAsGood = useMarkVersionAsGood(basePayload);

  const actions: VersionAction[] = [
    isPinned
      ? {
          content: 'Unpin version...',
          onClick: onUnpin,
        }
      : {
          content: isCurrent ? 'Pin version...' : 'Rollback to...',
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
