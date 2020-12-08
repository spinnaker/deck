import { deferred, isSuccessStatus, UrlArg, Verb } from './mockHttpUtils';
import { SETTINGS } from 'core/config';
import { isEqual, isMatch } from 'lodash';

function parseParams(queryString: string): Record<string, string | string[]> {
  const paramTuples = queryString.split('&').map((param) => param.split('='));

  return paramTuples.reduce((paramsObj, [key, value]) => {
    const currentValue = paramsObj[key];
    if (typeof currentValue === 'string') {
      paramsObj[key] = [currentValue, value];
    } else if (Array.isArray(currentValue)) {
      paramsObj[key] = paramsObj[key].concat(value);
    } else {
      paramsObj[key] = value;
    }
    return paramsObj;
  }, {} as Record<string, string | string[]>);
}

export class ExpectedRequest implements IExpectBuilder {
  /**
   * Creates a new ExpectRequest object
   * @param verb GET/PUT/POST/DELETE
   * @param url string, regexp, or matcher
   *            If a string, query params are parsed out of the string and used as a partial match against each request
   *            e.g.: '/foo/bar?param1=val1&param2=val2'
   */
  constructor(public verb: Verb, public url: UrlArg) {
    this.predicates.verb = (requestVerb) => requestVerb === verb;

    if (typeof url === 'string') {
      const [path, query] = url.split('?');
      this.predicates.url = (requestUrl) => requestUrl === path || requestUrl === SETTINGS.gateUrl + path;
      if (query) {
        // If there is a query string in the url, parse into params and match
        const parsedParams = parseParams(query);
        this.predicates.params = (requestParams) => isMatch(parsedParams, requestParams);
      }
    } else if (url instanceof RegExp) {
      this.predicates.url = (requestUrl) => !!url.exec(requestUrl);
    } else if (typeof url === 'function') {
      this.predicates.url = (requestUrl) => url(requestUrl);
    }
  }

  public response = {
    status: 200,
    data: null as any,
  };

  public isFulfilled = () => this.fulfilledDeferred.settled;
  public fulfilledDeferred = deferred();

  public fulfill() {
    const { status, data } = this.response;
    if (isSuccessStatus(status)) {
      this.fulfilledDeferred.resolve(data);
    } else {
      this.fulfilledDeferred.promise.catch(() => 0);
      this.fulfilledDeferred.reject({ status, data });
    }
  }

  private predicates = {
    verb: (_requestVerb: Verb) => true,
    url: (_requestUrl: string) => true,
    params: (_requestParams: object) => true,
  };

  isMatchAndUnfulfilled(verb: Verb, url: string, params: object) {
    const { predicates } = this;
    return !this.isFulfilled() && predicates.verb(verb) && predicates.url(url) && predicates.params(params);
  }

  withParams(expectedParams: {}, exact = false): IExpectBuilder {
    if (exact) {
      this.predicates.params = (requestParams) => isEqual(requestParams, expectedParams);
    } else {
      this.predicates.params = (requestParams) => isMatch(requestParams, expectedParams);
    }

    return this;
  }

  respond(status: number, data?: any): IExpectBuilder {
    this.response.status = status;
    this.response.data = data;
    return this;
  }
}

export interface IExpectBuilder {
  withParams(expectedParams: {}, exact?: boolean): IExpectBuilder;

  respond(status: number, data?: any): IExpectBuilder;
}
