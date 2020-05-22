import { IPromise } from 'angular';

import { API } from '@spinnaker/core';

import { IKeyPair } from 'tencentcloud/domain';

export class KeyPairsReader {
  public static listKeyPairs(): IPromise<IKeyPair[]> {
    return API.all('keyPairs')
      .useCache()
      .getList()
      .then((keyPairs: IKeyPair[]) => keyPairs.sort((a, b) => a.keyName.localeCompare(b.keyName)));
  }
}
