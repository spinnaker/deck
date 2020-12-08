import { ExpectedRequest } from './expectedRequest';
import { deferred, isSuccessStatus, tick, Verb } from './mockHttpUtils';

export class ReceivedRequest {
  constructor(public verb: Verb, public url: string, public params: object, public expectedRequest: ExpectedRequest) {}

  public isExpected = () => !!this.expectedRequest;
  public isFlushed = () => this.responseDeferred.settled;
  responseDeferred = deferred();

  flushResponse() {
    const data = this.expectedRequest?.response.data ?? [];
    const status = this.expectedRequest?.response.status ?? 200;

    if (isSuccessStatus(status)) {
      this.responseDeferred.resolve(data);
    } else {
      this.responseDeferred.reject({ status, data });
    }

    return tick();
  }
}
