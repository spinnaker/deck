import React from 'react';

import { useApplicationContextSafe } from 'core/presentation';

import { MessageBox, MessagesSection } from './MessageBox';
import { ManagementWarning } from '../config/ManagementWarning';
import { useFetchNotificationsQuery } from '../graphql/graphql-sdk';
import { useLogEvent } from '../utils/logging';

const AppNotifications = () => {
  const app = useApplicationContextSafe();
  const logEvent = useLogEvent('Error', 'AppNotifications');
  const { data, error } = useFetchNotificationsQuery({ variables: { appName: app.name } });

  React.useEffect(() => {
    if (error) {
      logEvent({ level: 'ERROR', error });
    }
  }, [error, logEvent]);

  const notifications = data?.application?.notifications || [];

  if (!notifications.length) return null;

  return (
    <MessagesSection>
      {notifications.map((notification) =>
        notification ? (
          <MessageBox key={notification.id} type={notification.level}>
            {notification.message}
          </MessageBox>
        ) : null,
      )}
    </MessagesSection>
  );
};

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
