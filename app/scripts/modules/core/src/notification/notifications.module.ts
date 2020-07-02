import './selector/types/bearychat/beary.notification';
import './selector/types/email/email.notification';
import './selector/types/githubstatus/githubstatus.notification';
import './selector/types/googlechat/googlechat.notification';
import './selector/types/pubsub/pubsub.notification';
import './selector/types/slack/slack.notification';
import './selector/types/sms/sms.notification';
import { NOTIFICATION_LIST } from './notificationList.module';
import { NotificationService } from './NotificationService';
import { extensionNotificationConfig } from './extensionNotificationConfig';
import { Registry } from 'core/registry';

import { module } from 'angular';

export const CORE_NOTIFICATION_NOTIFICATIONS_MODULE = 'spinnaker.core.notifications';
export const name = CORE_NOTIFICATION_NOTIFICATIONS_MODULE; // for backwards compatibility
module(CORE_NOTIFICATION_NOTIFICATIONS_MODULE, [NOTIFICATION_LIST]).run(() => {
  NotificationService.getNotificationTypeMetadata().then(types => {
    types.forEach(t => {
      Registry.pipeline.registerNotification({
        component: extensionNotificationConfig(t.parameters),
        isExtensionNotification: true,
        key: t.notificationType,
        label: t.notificationType,
      });
    });
  });
});
