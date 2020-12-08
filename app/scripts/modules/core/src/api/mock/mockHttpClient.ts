import { IHttpClientImplementation } from '../ApiService';
import { ExpectedRequest, IExpectBuilder } from './expectedRequest';
import { IDeferred, kickAngularJS, tick, UrlArg, Verb } from './mockHttpUtils';
import { ReceivedRequest } from './receivedRequest';

interface IRequest {
  verb: Verb;
  url: string;
  params: object;
  expected: boolean;
  responseDeferred: IDeferred;
  flushResponse: () => void;
}

type RequestListener = (request: ReceivedRequest) => void;

export class MockHttpClient implements IHttpClientImplementation {
  public autoFlush = false;
  public failOnUnexpectedRequests = true;
  public expectedRequests: ExpectedRequest[] = [];
  public receivedRequests: ReceivedRequest[] = [];

  private isFlushing = () => this.requestListeners.length > 0;

  public expect(verb: Verb, url?: UrlArg): IExpectBuilder {
    const expected = new ExpectedRequest(verb, url);
    this.expectedRequests.push(expected);
    return expected;
  }

  expectGET = (url?: UrlArg) => this.expect('GET', url);
  expectPUT = (url?: UrlArg) => this.expect('PUT', url);
  expectPOST = (url?: UrlArg) => this.expect('POST', url);
  expectDELETE = (url?: UrlArg) => this.expect('DELETE', url);
  expectPATCH = (url?: UrlArg) => this.expect('PATCH', url);

  request<T = any>(verb: Verb, url: string, params: {}): PromiseLike<T> {
    const expectedRequest = this.expectedRequests.find((expect) => expect.isMatchAndUnfulfilled(verb, url, params));
    const request = new ReceivedRequest(verb, url, params, expectedRequest);
    this.receivedRequests.push(request);

    expectedRequest?.fulfill();

    if (this.isFlushing() || this.autoFlush) {
      request.flushResponse();
    }

    this.requestListeners.forEach((listener) => listener(request));

    return request.responseDeferred.promise;
  }

  get = <T = any>(request: IRequest): PromiseLike<T> => this.request('GET', request.url, request.params);
  put = <T = any>(request: IRequest): PromiseLike<T> => this.request('PUT', request.url, request.params);
  post = <T = any>(request: IRequest): PromiseLike<T> => this.request('POST', request.url, request.params);
  patch = <T = any>(request: IRequest): PromiseLike<T> => this.request('PATCH', request.url, request.params);
  delete = <T = any>(request: IRequest): PromiseLike<T> => this.request('DELETE', request.url, request.params);

  private requestListeners: RequestListener[] = [];
  private addRequestListener = (listener: RequestListener) => {
    this.requestListeners.push(listener);
    return () => (this.requestListeners = this.requestListeners.filter((x) => x !== listener));
  };

  private needsFlush() {
    const hasUnflushedRequests = this.receivedRequests.some((req) => !req.isFlushed());
    const hasUnfulfilledExpects = this.expectedRequests.some((expected) => !expected.isFulfilled());
    return hasUnflushedRequests || hasUnfulfilledExpects;
  }

  async flush({ timeoutMs = 100, delayAfterMs = 0 } = {}): Promise<void> {
    // Run an AngularJS digest before checking if anything needs flushing
    kickAngularJS();

    if (!this.needsFlush()) {
      const message = 'There are no unflushed HTTP requests, nor are there any unfulfilled expected requests.';
      throw new Error(message);
    }

    let deregisterRequestListener: Function;

    try {
      await new Promise((resolve, reject) => {
        const resolvePromiseWhenFlushed = () => {
          // Poke AngularJS before checking for unflushed requests.
          // This enables code such as: $q.when().then(() => REST('/foo').get())
          kickAngularJS();

          const unflushedRequests = this.receivedRequests.filter((req) => !req.isFlushed());
          unflushedRequests.forEach((req) => req.flushResponse());
          const allExpectedRequestsFulfilled = this.expectedRequests.every((expected) => expected.isFulfilled());
          if (allExpectedRequestsFulfilled) {
            const message = `All ${this.expectedRequests.length} expected requests are fulfilled`;
            setTimeout(() => {
              resolve(message);
              // Poke AngularJS again after resolving the promise
              kickAngularJS();
            }, delayAfterMs);
          }
          // If we flushed any responses, wake AngularJS up
          // This enables code such as: $q.when(REST('/foo').get())
          if (unflushedRequests.length) {
            setTimeout(kickAngularJS);
          }
        };

        deregisterRequestListener = this.addRequestListener(resolvePromiseWhenFlushed);

        // If we haven't successfully flushed all requests and expects after timeoutMs, reject the promise returned from .flush()
        const timeoutMessage = `MockHttpClient.flush() timed out after ${timeoutMs}ms`;
        const message = [timeoutMessage].concat(this.getOutstandingExpectationMessages()).join('\n');
        setTimeout(() => reject(message), timeoutMs);

        // Run the initial check
        resolvePromiseWhenFlushed();
      });

      // Wait a few JS ticks afterwards to allow callbacks to be processed
      // Is more than one tick helpful? I don't know... who knows? it's a mystery.
      for (let i = 0; i < 10; i++) {
        await tick();
      }
    } finally {
      if (deregisterRequestListener) {
        deregisterRequestListener();
      }
    }
  }

  private getOutstandingExpectationMessages() {
    const outstanding = this.expectedRequests.filter((expected) => !expected.isFulfilled());

    if (!outstanding.length) {
      return [];
    }

    return [
      `${outstanding.length} outstanding requests.`,
      'The following HTTP calls were expected, but were not received:',
      ...outstanding.map((expected) => `\t- HTTP ${expected.verb} ${expected.url}`),
    ];
  }

  verifyNoOutstandingExpectation() {
    const outstanding = this.getOutstandingExpectationMessages();
    const message = outstanding.join('\n');
    expect(outstanding.length).toBe(0, message);
  }

  verifyNoOutstandingRequests() {
    const outstanding = this.receivedRequests.filter((req) => !req.isFlushed());

    if (outstanding.length) {
      const message = [
        `${outstanding.length} unflushed HTTP requests.  Call MockHttpClient.flush() to flush requests.`,
        'The following HTTP calls were initiated, but the responses were not flushed:',
        ...outstanding.map((expected) => `\t- HTTP ${expected.verb} ${expected.url}`),
      ].join('\n');

      expect(outstanding.length).toBe(0, message);
    }
  }

  verifyNoUnexpectedRequests() {
    const unexpected = this.receivedRequests.filter((req) => !req.isExpected());

    if (this.failOnUnexpectedRequests && unexpected.length) {
      const message = [
        `${unexpected.length} unexpected HTTP requests.  Call MockHttpClient.failOnUnexpectedRequests = false to ignore these requests.`,
        'The following HTTP calls were received but were not expected:',
        ...unexpected.map((req) => `\t- HTTP ${req.verb} ${req.url}`),
      ].join('\n');

      expect(unexpected.length).toBe(0, message);
    }
  }
}
