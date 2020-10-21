import { IQService, IPromise } from '@types/angular';

// add an overload for normalizing a regular Promise into an angular IPromise
declare module '@types/angular' {
  interface IQService {
    when<T>(promise: Promise<T>): IPromise<T>;
    resolve<T>(promise: Promise<T>): IPromise<T>;
  }
}


declare global {
  // This allows an angular $q promise to be returned as a PromiseLike<T>
  interface PromiseLike<T> {
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): PromiseLike<T | TResult>;
  }
}
