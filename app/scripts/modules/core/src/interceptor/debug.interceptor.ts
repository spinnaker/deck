import {module, IRequestConfig, IHttpInterceptor, IHttpProvider} from 'angular';
import {$log, $location} from 'ngimport';
import {JSON_UTILITY_SERVICE, JsonUtilityService} from 'core/utils/json/json.utility.service';
import autoBindMethods from 'class-autobind-decorator';

@autoBindMethods
export class DebugInterceptor implements IHttpInterceptor {

  constructor(private jsonUtilityService: JsonUtilityService) { 'ngInject'; }

  public request(config: IRequestConfig): IRequestConfig {
    try { // This is a great opportunity to break Deck, so be careful.
      this.logMutatingRequest(config);
    } catch (e) {
      $log.warn('Debug interceptor bug: ', e.message);
    }
    return config;
  }

  private logMutatingRequest(config: IRequestConfig): void {
    if ($location.url() &&
        $location.url().includes('debug=true') &&
        ['POST', 'PUT', 'DELETE'].includes(config.method)) {
      $log.log(`${config.method}: ${config.url} \n`, this.jsonUtilityService.makeSortedStringFromObject(config.data));
    }
  }
}

export const DEBUG_INTERCEPTOR = 'spinnaker.core.debug.interceptor';
module(DEBUG_INTERCEPTOR, [JSON_UTILITY_SERVICE])
  .service('debugInterceptor', DebugInterceptor)
  .config(($httpProvider: IHttpProvider) => $httpProvider.interceptors.push('debugInterceptor'));
