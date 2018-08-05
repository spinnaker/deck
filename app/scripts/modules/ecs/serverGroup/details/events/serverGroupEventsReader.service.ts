import { IPromise } from 'angular';

import { $log } from 'ngimport';

import { API } from 'core/api/ApiService';
import { IServerGroup } from 'core/domain';

export class ServerGroupEventsReader {
  public static getEvents(serverGroup: IServerGroup): IPromise<any[]> {
    return API.one('applications')
      .one(serverGroup.app)
      .all(serverGroup.account)
      .one(serverGroup.name)
      .all('events')
      .withParams({
        region: serverGroup.region,
        provider: serverGroup.cloudProvider,
      })
      .getList()
      .catch((error: any): any[] => {
        $log.error(error, 'error retrieving events');
        return [];
      });
  }
}
