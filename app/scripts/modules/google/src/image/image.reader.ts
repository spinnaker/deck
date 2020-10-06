import { IPromise } from 'angular';

import { API } from '@spinnaker/core';

export interface IGceImage {
  imageName: string;
}

export class GceImageReader {
  public static findImages(params: { account?: string; provider?: string; q?: string }): IPromise<IGceImage[]> {
    return API.one('images/find')
      .withParams(params)
      .get()
      .catch(() => [] as IGceImage[]);
  }

  public static getImage(/*amiName: string, region: string, credentials: string*/): IPromise<IGceImage> {
    // GCE images are not regional so we don't need to retrieve ids scoped to regions.
    return null;
  }
}
