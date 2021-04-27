/* eslint-disable @typescript-eslint/array-type */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {};
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  InstantTime: string;
  JSON: any;
}

export interface DgsApplication {
  __typename?: 'DgsApplication';
  name: Scalars['String'];
  account: Scalars['String'];
  environments: Array<DgsEnvironment>;
}

export interface DgsArtifact {
  __typename?: 'DgsArtifact';
  environment: Scalars['String'];
  name: Scalars['String'];
  type: Scalars['String'];
  reference: Scalars['String'];
  versions?: Maybe<Array<DgsArtifactVersionInEnvironment>>;
  pinnedVersion?: Maybe<DgsPinnedVersion>;
}

export interface DgsArtifactVersionsArgs {
  statuses?: Maybe<Array<DgsArtifactStatusInEnvironment>>;
}

export type DgsArtifactStatusInEnvironment =
  | 'PENDING'
  | 'APPROVED'
  | 'DEPLOYING'
  | 'CURRENT'
  | 'PREVIOUS'
  | 'VETOED'
  | 'SKIPPED';

export interface DgsArtifactVersionInEnvironment {
  __typename?: 'DgsArtifactVersionInEnvironment';
  version: Scalars['String'];
  buildNumber?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['InstantTime']>;
  deployedAt?: Maybe<Scalars['InstantTime']>;
  resources?: Maybe<Array<DgsResource>>;
  gitMetadata?: Maybe<DgsGitMetadata>;
  environment?: Maybe<Scalars['String']>;
  reference: Scalars['String'];
  status?: Maybe<DgsArtifactStatusInEnvironment>;
  lifecycleSteps?: Maybe<Array<DgsLifecycleStep>>;
  constraints?: Maybe<Array<DgsConstraint>>;
  verifications?: Maybe<Array<DgsVerification>>;
}

export interface DgsCommitInfo {
  __typename?: 'DgsCommitInfo';
  sha?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
}

export interface DgsConstraint {
  __typename?: 'DgsConstraint';
  type: Scalars['String'];
  status: DgsConstraintStatus;
  startedAt?: Maybe<Scalars['InstantTime']>;
  judgedAt?: Maybe<Scalars['InstantTime']>;
  judgedBy?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  attributes?: Maybe<Scalars['JSON']>;
}

export type DgsConstraintStatus = 'NOT_EVALUATED' | 'PENDING' | 'PASS' | 'FAIL' | 'OVERRIDE_PASS' | 'OVERRIDE_FAIL';

export interface DgsEnvironment {
  __typename?: 'DgsEnvironment';
  name: Scalars['String'];
  state: DgsEnvironmentState;
}

export interface DgsEnvironmentState {
  __typename?: 'DgsEnvironmentState';
  resources?: Maybe<Array<DgsResource>>;
  artifacts?: Maybe<Array<DgsArtifact>>;
}

export interface DgsGitMetadata {
  __typename?: 'DgsGitMetadata';
  commit?: Maybe<Scalars['String']>;
  author?: Maybe<Scalars['String']>;
  project?: Maybe<Scalars['String']>;
  branch?: Maybe<Scalars['String']>;
  repoName?: Maybe<Scalars['String']>;
  pullRequest?: Maybe<DgsPullRequest>;
  commitInfo?: Maybe<DgsCommitInfo>;
}

export type DgsLifecycleEventScope = 'PRE_DEPLOYMENT';

export type DgsLifecycleEventStatus = 'NOT_STARTED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'ABORTED' | 'UNKNOWN';

export type DgsLifecycleEventType = 'BAKE' | 'BUILD';

export interface DgsLifecycleStep {
  __typename?: 'DgsLifecycleStep';
  scope?: Maybe<DgsLifecycleEventScope>;
  type: DgsLifecycleEventType;
  id?: Maybe<Scalars['String']>;
  status: DgsLifecycleEventStatus;
  text?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
  startedAt?: Maybe<Scalars['InstantTime']>;
  completedAt?: Maybe<Scalars['InstantTime']>;
  artifactVersion?: Maybe<Scalars['String']>;
}

export interface DgsLocation {
  __typename?: 'DgsLocation';
  account?: Maybe<Scalars['String']>;
  regions?: Maybe<Array<Scalars['String']>>;
}

export interface DgsMoniker {
  __typename?: 'DgsMoniker';
  app?: Maybe<Scalars['String']>;
  stack?: Maybe<Scalars['String']>;
  detail?: Maybe<Scalars['String']>;
}

export interface DgsPinnedVersion {
  __typename?: 'DgsPinnedVersion';
  name: Scalars['String'];
  reference: Scalars['String'];
  version: Scalars['String'];
  pinnedAt?: Maybe<Scalars['InstantTime']>;
  pinnedBy?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
}

export interface DgsPullRequest {
  __typename?: 'DgsPullRequest';
  number?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
}

export interface DgsResource {
  __typename?: 'DgsResource';
  id: Scalars['String'];
  kind: Scalars['String'];
  moniker?: Maybe<DgsMoniker>;
  status?: Maybe<DgsResourceStatus>;
  artifact?: Maybe<DgsArtifact>;
  displayName?: Maybe<Scalars['String']>;
  location?: Maybe<DgsLocation>;
}

export type DgsResourceStatus =
  | 'CREATED'
  | 'DIFF'
  | 'ACTUATING'
  | 'HAPPY'
  | 'UNHAPPY'
  | 'MISSING_DEPENDENCY'
  | 'CURRENTLY_UNRESOLVABLE'
  | 'ERROR'
  | 'PAUSED'
  | 'RESUMED'
  | 'UNKNOWN'
  | 'DIFF_NOT_ACTIONABLE'
  | 'WAITING';

export interface DgsVerification {
  __typename?: 'DgsVerification';
  id: Scalars['String'];
  type: Scalars['String'];
  status?: Maybe<DgsConstraintStatus>;
  startedAt?: Maybe<Scalars['InstantTime']>;
  completedAt?: Maybe<Scalars['InstantTime']>;
  link?: Maybe<Scalars['String']>;
}

export interface Query {
  __typename?: 'Query';
  application?: Maybe<DgsApplication>;
}

export interface QueryApplicationArgs {
  appName: Scalars['String'];
}

export type FetchApplicationQueryVariables = Exact<{
  appName: Scalars['String'];
}>;

export type FetchApplicationQuery = { __typename?: 'Query' } & {
  application?: Maybe<
    { __typename?: 'DgsApplication' } & Pick<DgsApplication, 'name' | 'account'> & {
        environments: Array<
          { __typename?: 'DgsEnvironment' } & Pick<DgsEnvironment, 'name'> & {
              state: { __typename?: 'DgsEnvironmentState' } & {
                artifacts?: Maybe<
                  Array<
                    { __typename?: 'DgsArtifact' } & Pick<DgsArtifact, 'name' | 'type' | 'reference'> & {
                        versions?: Maybe<
                          Array<
                            { __typename?: 'DgsArtifactVersionInEnvironment' } & Pick<
                              DgsArtifactVersionInEnvironment,
                              'buildNumber' | 'version' | 'createdAt' | 'status' | 'deployedAt'
                            > & {
                                gitMetadata?: Maybe<
                                  { __typename?: 'DgsGitMetadata' } & Pick<
                                    DgsGitMetadata,
                                    'commit' | 'author' | 'branch'
                                  > & {
                                      commitInfo?: Maybe<
                                        { __typename?: 'DgsCommitInfo' } & Pick<
                                          DgsCommitInfo,
                                          'sha' | 'link' | 'message'
                                        >
                                      >;
                                      pullRequest?: Maybe<
                                        { __typename?: 'DgsPullRequest' } & Pick<DgsPullRequest, 'number' | 'link'>
                                      >;
                                    }
                                >;
                                lifecycleSteps?: Maybe<
                                  Array<
                                    { __typename?: 'DgsLifecycleStep' } & Pick<
                                      DgsLifecycleStep,
                                      'startedAt' | 'completedAt' | 'type' | 'status'
                                    >
                                  >
                                >;
                                constraints?: Maybe<
                                  Array<
                                    { __typename?: 'DgsConstraint' } & Pick<
                                      DgsConstraint,
                                      'type' | 'status' | 'attributes'
                                    >
                                  >
                                >;
                              }
                          >
                        >;
                        pinnedVersion?: Maybe<
                          { __typename?: 'DgsPinnedVersion' } & Pick<DgsPinnedVersion, 'name' | 'reference'>
                        >;
                      }
                  >
                >;
                resources?: Maybe<
                  Array<
                    { __typename?: 'DgsResource' } & Pick<DgsResource, 'id' | 'kind' | 'status' | 'displayName'> & {
                        moniker?: Maybe<{ __typename?: 'DgsMoniker' } & Pick<DgsMoniker, 'app' | 'stack' | 'detail'>>;
                        location?: Maybe<{ __typename?: 'DgsLocation' } & Pick<DgsLocation, 'regions'>>;
                      }
                  >
                >;
              };
            }
        >;
      }
  >;
};

export const FetchApplicationDocument = gql`
  query fetchApplication($appName: String!) {
    application(appName: $appName) {
      name
      account
      environments {
        name
        state {
          artifacts {
            name
            type
            reference
            versions(statuses: [PENDING, APPROVED, DEPLOYING, CURRENT]) {
              buildNumber
              version
              createdAt
              status
              gitMetadata {
                commit
                author
                branch
                commitInfo {
                  sha
                  link
                  message
                }
                pullRequest {
                  number
                  link
                }
              }
              deployedAt
              lifecycleSteps {
                startedAt
                completedAt
                type
                status
              }
              constraints {
                type
                status
                attributes
              }
            }
            pinnedVersion {
              name
              reference
            }
          }
          resources {
            id
            kind
            status
            displayName
            moniker {
              app
              stack
              detail
            }
            location {
              regions
            }
          }
        }
      }
    }
  }
`;

/**
 * __useFetchApplicationQuery__
 *
 * To run a query within a React component, call `useFetchApplicationQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchApplicationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchApplicationQuery({
 *   variables: {
 *      appName: // value for 'appName'
 *   },
 * });
 */
export function useFetchApplicationQuery(
  baseOptions: Apollo.QueryHookOptions<FetchApplicationQuery, FetchApplicationQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FetchApplicationQuery, FetchApplicationQueryVariables>(FetchApplicationDocument, options);
}
export function useFetchApplicationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<FetchApplicationQuery, FetchApplicationQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<FetchApplicationQuery, FetchApplicationQueryVariables>(FetchApplicationDocument, options);
}
export type FetchApplicationQueryHookResult = ReturnType<typeof useFetchApplicationQuery>;
export type FetchApplicationLazyQueryHookResult = ReturnType<typeof useFetchApplicationLazyQuery>;
export type FetchApplicationQueryResult = Apollo.QueryResult<FetchApplicationQuery, FetchApplicationQueryVariables>;
