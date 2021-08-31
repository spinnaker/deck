import React from 'react';

import { MessageBox, MessagesSection } from './MessageBox';
import { RelativeTimestamp } from '../RelativeTimestamp';
import { ManagementWarning } from '../config/ManagementWarning';
import {
  FetchNotificationsDocument,
  FetchNotificationsQueryVariables,
  useDismissNotificationMutation,
  useFetchNotificationsQuery,
} from '../graphql/graphql-sdk';
import { useApplicationContextSafe } from '../../presentation';
import { useLogEvent } from '../utils/logging';
import { NotifierService } from '../../widgets';

const AppNotifications = () => {
  const app = useApplicationContextSafe();
  const logEvent = useLogEvent('Error', 'AppNotifications');
  const variables: FetchNotificationsQueryVariables = { appName: app.name };
  const { data, error } = useFetchNotificationsQuery({ variables });
  const [onDismiss, { error: onDismissError }] = useDismissNotificationMutation({
    refetchQueries: [{ query: FetchNotificationsDocument, variables }],
  });

  React.useEffect(() => {
    if (error) {
      logEvent({ level: 'ERROR', error });
    }
  }, [error, logEvent]);

  React.useEffect(() => {
    if (!onDismissError) return;
    NotifierService.publish({ content: 'Failed to dismiss message', key: `dismiss-notification` });
    logEvent({ level: 'ERROR', error: onDismissError });
  }, [onDismissError, logEvent]);

  const notifications = data?.application?.notifications || [];

  if (!notifications.length) return null;

  return (
    <MessagesSection>
      {notifications.map((notification) => (
        <MessageBox
          key={notification.id}
          type={notification.level}
          onDismiss={() => onDismiss({ variables: { payload: { application: app.name, id: notification.id } } })}
        >
          {notification.message}{' '}
          {notification.triggeredAt && (
            <>
              (<RelativeTimestamp timestamp={notification.triggeredAt} withSuffix />)
            </>
          )}
          {notification.link && (
            <>
              {' '}
              -{' '}
              <a href={notification.link} target="_blank">
                View
              </a>
            </>
          )}
        </MessageBox>
      ))}
    </MessagesSection>
  );
};

interface IMessagesProps {
  showManagementWarning?: boolean;
}

export const Messages = ({ showManagementWarning = true }: IMessagesProps) => {
  const app = useApplicationContextSafe();
  return (
    <>
      <AppNotifications />
      {showManagementWarning && <ManagementWarning appName={app.name} />}
    </>
  );
};
