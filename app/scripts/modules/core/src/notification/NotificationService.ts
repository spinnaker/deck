import { IPromise } from 'angular';

import { API } from 'core/api/ApiService';

export interface INotificationParameter {
  name: string;
  defaultValue: string;
  type: string;
  label: string;
  description: string;
}

export interface INotificationTypeMetadata {
  notificationType: string;
  parameters: INotificationParameter[];
}

export class NotificationService {
  public static getNotificationTypeMetadata(): IPromise<INotificationTypeMetadata[]> {
    return API.one('notifications')
      .all('metadata')
      .useCache()
      .getList();
  }
}
