import { $httpBackend } from 'ngimport';

export type Verb = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type UrlArg = string | RegExp | ((url: string) => boolean);

export interface IDeferred {
  promise: Promise<any>;
  resolve: (result: any) => void;
  reject: (error: any) => void;
  settled: boolean;
}

export function deferred() {
  const deferredObj = {} as IDeferred;
  deferredObj.promise = new Promise((resolve, reject) => {
    deferredObj.settled = false;

    deferredObj.resolve = (result) => {
      deferredObj.settled = true;
      resolve(result);
    };

    deferredObj.reject = (error) => {
      deferredObj.settled = true;
      reject(error);
    };
  });

  return deferredObj;
}

export function kickAngularJS() {
  try {
    $httpBackend.flush();
    // eslint-disable-next-line no-empty
  } catch (ignore) {}
}

export const tick = (ms?: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const isSuccessStatus = (status: number) => status >= 200 && status <= 299;
