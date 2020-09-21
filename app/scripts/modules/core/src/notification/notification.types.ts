import { cloneDeep } from 'lodash';
import { SETTINGS, INotificationSettings } from 'core/config';
import { INotificationTypeConfig } from 'core/domain';
import { Registry } from 'core/registry';

import { bearyChatNotification } from './selector/types/bearychat/beary.notification';
import { emailNotification } from './selector/types/email/email.notification';
import { githubstatusNotification } from './selector/types/githubstatus/githubstatus.notification';
import { googlechatNotification } from './selector/types/googlechat/googlechat.notification';
import { microsoftTeamsNotification } from './selector/types/microsoftteams/microsoftteams.notification';
import { pubsubNotification } from './selector/types/pubsub/pubsub.notification';
import { slackNotification } from './selector/types/slack/slack.notification';
import { smsNotification } from './selector/types/sms/sms.notification';

[
  bearyChatNotification,
  emailNotification,
  githubstatusNotification,
  googlechatNotification,
  microsoftTeamsNotification,
  pubsubNotification,
  slackNotification,
  smsNotification,
].forEach((config: INotificationTypeConfig) => {
  if (SETTINGS.notifications) {
    const notificationSetting: { enabled: boolean; botName?: string } =
      SETTINGS.notifications[config.key as keyof INotificationSettings];

    if (notificationSetting?.enabled) {
      Registry.pipeline.registerNotification({
        config: { ...notificationSetting },
        ...cloneDeep(config),
      });
    }
  } else {
    Registry.pipeline.registerNotification(cloneDeep(config));
  }
});
