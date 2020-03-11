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
      .withParams({ includeDetails: true, entities: 'resources' })
      .get()
      .then(this.decorateResources);
  }

  public static getEnvironmentsSummary(
    app: string,
  ): IPromise<IManagedApplicationSummary<'resources' | 'artifacts' | 'environments'>> {
    // return this.getFakeRealData(app);
    return API.one('managed')
      .one('application', app)
      .withParams({ includeDetails: true, entities: ['resources', 'artifacts', 'environments'] })
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
            (event as IManagedResourceEvent).delta = transformManagedResourceDiff(event.delta);
          }
        });
        return response as IManagedResourceEventHistory;
      });
  }

  public static getFakeRealData(app: string): IPromise<IManagedApplicationSummary> {
    return API.one('applications', app)
      .get()
      .then(() =>
        JSON.parse(
          JSON.stringify({
            applicationPaused: false,
            hasManagedResources: true,
            resources: [
              {
                id: 'titus:cluster:titustestvpc:serverlablpollo',
                kind: 'titus/cluster@v1',
                status: ManagedResourceStatus.ACTUATING,
                moniker: {
                  app: 'serverlablpollo',
                },
                isPaused: false,
                // TODO: This attribute is not yet returned by the API
                // artifact: {
                //   name: 'spkr/mddemo-titus',
                //   type: 'docker',
                //   statuses: [],
                //   versions: {
                //     current: 'latest',
                //     pending: [],
                //     approved: [],
                //     previous: ['oldest'],
                //     vetoed: [],
                //   },
                // },
                locations: {
                  account: 'titustestvpc',
                  vpc: 'vpc0',
                  regions: [
                    {
                      name: 'eu-west-1',
                    },
                    {
                      name: 'us-east-1',
                    },
                    {
                      name: 'us-west-2',
                    },
                  ],
                },
              },
              {
                id: 'titus:cluster:titusprodvpc:serverlablpollo',
                kind: 'titus/cluster@v1',
                status: ManagedResourceStatus.ACTUATING,
                moniker: {
                  app: 'serverlablpollo',
                },
                isPaused: false,
                // TODO: This attribute is not yet returned by the API
                // artifact: {
                //   name: 'spkr/mddemo-titus',
                //   type: 'docker',
                //   statuses: [],
                //   versions: {
                //     current: 'latest',
                //     pending: [],
                //     approved: [],
                //     previous: ['oldest'],
                //     vetoed: [],
                //   },
                // },
                locations: {
                  account: 'titusprodvpc',
                  vpc: 'vpc0',
                  regions: [
                    {
                      name: 'eu-west-1',
                    },
                    {
                      name: 'us-east-1',
                    },
                    {
                      name: 'us-west-2',
                    },
                  ],
                },
              },
            ],
            environments: [
              {
                artifacts: [
                  {
                    name: 'spkr/mddemo-titus',
                    type: 'docker',
                    statuses: [],
                    versions: {
                      current: 'latest',
                      pending: [],
                      approved: [],
                      previous: ['oldest'],
                      vetoed: [],
                    },
                  },
                ],
                name: 'prod',
                resources: ['titus:cluster:titusprodvpc:serverlablpollo'],
              },
              {
                artifacts: [
                  {
                    name: 'spkr/mddemo-titus',
                    type: 'docker',
                    statuses: [],
                    versions: {
                      current: 'latest',
                      pending: [],
                      approved: [],
                      previous: ['oldest'],
                      vetoed: [],
                    },
                  },
                ],
                name: 'test',
                resources: ['titus:cluster:titustestvpc:serverlablpollo'],
              },
            ],
            artifacts: [
              {
                name: 'spkr/mddemo-titus',
                type: 'docker',
                versions: [
                  {
                    version: 'latest',
                    environments: [
                      {
                        name: 'test',
                        state: 'CURRENT',
                        deployedAt: '2020-03-04T13:20:03Z',
                      },
                    ],
                  },
                  {
                    version: 'oldest',
                    environments: [
                      {
                        name: 'test',
                        state: 'PREVIOUS',
                        deployedAt: '2020-03-03T13:20:03Z',
                        replacedAt: '2020-03-04T13:20:03Z',
                        replacedBy: 'latest',
                      },
                    ],
                  },
                ],
              },
            ],
          }),
        ),
      );
  }
}
