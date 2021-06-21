import React from 'react';

import { useApplicationContextSafe } from 'core/presentation';

import { MessagesSection } from './MessageBox';
import { ManagementWarning } from '../config/ManagementWarning';

export const Messages = () => {
  const app = useApplicationContextSafe();
  return (
    <>
      <MessagesSection sticky>
        <ManagementWarning appName={app.name} />
      </MessagesSection>
    </>
  );
};
