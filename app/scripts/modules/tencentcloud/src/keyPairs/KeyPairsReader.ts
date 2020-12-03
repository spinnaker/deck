import { API } from '@spinnaker/core';

import { IKeyPair } from 'tencentcloud/domain';

export class KeyPairsReader {
  public static listKeyPairs(): PromiseLike<IKeyPair[]> {
    return API.path('keyPairs')
      .useCache()
      .get()
      .then((keyPairs: IKeyPair[]) => keyPairs.sort((a, b) => a.keyName.localeCompare(b.keyName)));
  }
}
