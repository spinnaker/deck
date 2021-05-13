import React from 'react';

import { QueryConstraint, QueryVerificationStatus } from '../types';

type AllStatuses = QueryConstraint['status'] | QueryVerificationStatus;
export const ACTION_DISPLAY_NAMES = ['passed', 'overridden', 'pending', 'failed'] as const;
export type ActionDisplayName = typeof ACTION_DISPLAY_NAMES[number];

const DEFAULT_ICON = 'far fa-hourglass';

type ActionStatusUtils = {
  [key in AllStatuses]: { color?: string; icon: string; displayName: ActionDisplayName };
};

// This ensures that we cover all of the options
const actionStatusUtilsInternal: ActionStatusUtils = {
  FAIL: { color: 'var(--color-status-error)', icon: 'fas fa-times', displayName: 'failed' },
  FORCE_PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check', displayName: 'overridden' },
  PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check', displayName: 'passed' },
  PENDING: { icon: DEFAULT_ICON, displayName: 'pending' },
  NOT_EVALUATED: { icon: DEFAULT_ICON, displayName: 'pending' },
  BLOCKED: { icon: DEFAULT_ICON, displayName: 'pending' },
};

// This forces the consumer to verify that the value exists (important in the case of a breaking change on the backend)
export const actionStatusUtils: Partial<ActionStatusUtils> = actionStatusUtilsInternal;

interface IVersionOperationIconProps {
  status: AllStatuses;
}

export const VersionOperationIcon = ({ status }: IVersionOperationIconProps) => {
  return (
    <i
      className={actionStatusUtils[status]?.icon || DEFAULT_ICON}
      style={{ color: actionStatusUtils[status]?.color || 'var(--color-titanium)' }}
    />
  );
};
