import { IPromise } from 'angular';
import { get, set, flatMap } from 'lodash';

import { API } from 'core/api';
import {
  IManagedApplicationSummary,
  ManagedResourceStatus,
  IManagedResourceEventHistoryResponse,
  IManagedResourceEventHistory,
  IManagedResourceDiff,
  IManagedResourceEvent,
  IManagedApplicationEnvironmentSummary,
} from 'core/domain';

const KIND_NAME_MATCHER = /.*\/(.*?)@/i;
const RESOURCE_DIFF_LIST_MATCHER = /^(.*)\[(.*)\]$/i;

export const getKindName = (kind: string) => {
  const match = kind.match(KIND_NAME_MATCHER);
  const extractedKind = match && match[1];

  return extractedKind || kind;
};

export const getResourceKindForLoadBalancerType = (type: string) => {
  switch (type) {
    case 'classic':
      return 'classic-load-balancer';
    case 'application':
      return 'application-load-balancer';
    default:
      return null;
  }
};

const transformManagedResourceDiff = (diff: IManagedResourceEventHistoryResponse[0]['delta']): IManagedResourceDiff =>
  Object.keys(diff).reduce((transformed, key) => {
    const diffNode = diff[key];
    const fieldKeys = flatMap<string, string>(key.split('/').filter(Boolean), fieldKey => {
      // Region keys currently come wrapped in {}, which is distracting and not useful. Let's trim those off.
      if (fieldKey.startsWith('{') && fieldKey.endsWith('}')) {
        return fieldKey.substring(1, fieldKey.length - 1);
      }

      // When items are added or removed from lists/sets, the API gives back a key like parentField[listItem].
      // This trips up our slash-bashed hierarchy and means we need to extract both componnts of the list syntax,
      // then flatten them out into the array of nested fields
      const listMatch = fieldKey.match(RESOURCE_DIFF_LIST_MATCHER);

      if (listMatch) {
        const parentField = listMatch[1];
        const listItem = listMatch[2];

        return [parentField, listItem];
      }

      return fieldKey;
    });
    const path = `["${fieldKeys.join(`"]["fields"]["`)}"]`;

    const existingTransformedNode: IManagedResourceDiff = get(transformed, path);
    set(transformed, path, {
      ...existingTransformedNode,
      key,
      diffType: diffNode.state,
      actual: diffNode.current,
      desired: diffNode.desired,
    });
    return transformed;
  }, {} as IManagedResourceDiff);

export class ManagedReader {
  private static decorateResources(response: IManagedApplicationSummary) {
    // Individual resources don't update their status when an application is paused/resumed,
    // so for now let's swap to a PAUSED status and keep things simpler in downstream components.
    if (response.applicationPaused) {
      response.resources.forEach(resource => (resource.status = ManagedResourceStatus.PAUSED));
    }

    response.resources.forEach(resource => (resource.isPaused = resource.status === ManagedResourceStatus.PAUSED));

    return response;
  }

  public static getApplicationSummary(app: string): IPromise<IManagedApplicationSummary<'resources'>> {
    return API.one('managed')
      .one('application', app)
      .withParams({ entities: 'resources' })
      .get()
      .then(this.decorateResources);
  }

  public static getEnvironmentsSummary(app: string): IPromise<IManagedApplicationEnvironmentSummary> {
    return API.one('managed')
      .one('application', app)
      .withParams({ entities: ['resources', 'artifacts', 'environments'] })
      .get()
      .then(this.decorateResources);
  }

  public static getResourceHistory(resourceId: string): IPromise<IManagedResourceEventHistory> {
    return API.one('history', resourceId)
      .withParams({ limit: 100 })
      .get()
      .then((response: IManagedResourceEventHistoryResponse) => {
        response.forEach(event => {
          if (event.delta) {
            ((event as unknown) as IManagedResourceEvent).delta = transformManagedResourceDiff(event.delta);
          }
        });
        return (response as unknown) as IManagedResourceEventHistory;
      });
  }
}
