import React from 'react';

import { QueryConstraint, QueryVerificationStatus } from '../types';

const constraintStatusUtils: {
  [key in QueryConstraint['status'] | QueryVerificationStatus]: { color?: string; icon: string };
} = {
  FAIL: { color: 'var(--color-status-error)', icon: 'fas fa-times' },
  FORCE_PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check' },
  PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check' },
  PENDING: { icon: 'far fa-hourglass' },
};

export const VersionOperationIcon = ({ status }: { status: QueryConstraint['status'] }) => {
  return (
    <i
      className={constraintStatusUtils[status].icon}
      style={{ color: constraintStatusUtils[status].color || 'var(--color-titanium)' }}
    />
  );
};
