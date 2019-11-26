import { API } from '@spinnaker/core';

export interface ISlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  creator: string;
  is_archived: boolean;
  name_normalized: string;
  num_members: number;
}

export class SlackReader {
  public static getChannels(): Promise<ISlackChannel[]> {
    return API.one('slack/channels')
      .getList()
      .catch(() => [] as ISlackChannel[]);
  }
}
