import React from 'react';

import { QueryConstraint, QueryVerificationStatus } from '../types';

type AllStatuses = QueryConstraint['status'] | QueryVerificationStatus;

export const actionStatusUtils: {
  [key in AllStatuses]: { color?: string; icon: string; displayName: string };
} = {
  FAIL: { color: 'var(--color-status-error)', icon: 'fas fa-times', displayName: 'failed' },
  FORCE_PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check', displayName: 'overridden' },
  PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check', displayName: 'passed' },
  PENDING: { icon: 'far fa-hourglass', displayName: 'pending' },
  NOT_EVALUATED: { icon: 'far fa-hourglass', displayName: 'pending' },
};

export const VersionOperationIcon = ({ status }: { status: AllStatuses }) => {
  return (
    <i
      className={actionStatusUtils[status].icon}
      style={{ color: actionStatusUtils[status].color || 'var(--color-titanium)' }}
    />
  );
};
