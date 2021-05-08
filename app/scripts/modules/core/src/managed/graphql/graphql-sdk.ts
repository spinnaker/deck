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

export interface MdApplication {
  __typename?: 'MdApplication';
  id: Scalars['String'];
  name: Scalars['String'];
  account: Scalars['String'];
  environments: Array<MdEnvironment>;
}

export interface MdArtifact {
  __typename?: 'MdArtifact';
  id: Scalars['String'];
  environment: Scalars['String'];
  name: Scalars['String'];
  type: Scalars['String'];
  reference: Scalars['String'];
  versions?: Maybe<Array<MdArtifactVersionInEnvironment>>;
  pinnedVersion?: Maybe<MdPinnedVersion>;
}

export interface MdArtifactVersionsArgs {
  statuses?: Maybe<Array<MdArtifactStatusInEnvironment>>;
}

export type MdArtifactStatusInEnvironment =
  | 'PENDING'
  | 'APPROVED'
  | 'DEPLOYING'
  | 'CURRENT'
  | 'PREVIOUS'
  | 'VETOED'
  | 'SKIPPED';

export interface MdArtifactVersionInEnvironment {
  __typename?: 'MdArtifactVersionInEnvironment';
  id: Scalars['String'];
  version: Scalars['String'];
  buildNumber?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['InstantTime']>;
  deployedAt?: Maybe<Scalars['InstantTime']>;
  resources?: Maybe<Array<MdResource>>;
  gitMetadata?: Maybe<MdGitMetadata>;
  environment?: Maybe<Scalars['String']>;
  reference: Scalars['String'];
  status?: Maybe<MdArtifactStatusInEnvironment>;
  lifecycleSteps?: Maybe<Array<MdLifecycleStep>>;
  constraints?: Maybe<Array<MdConstraint>>;
  verifications?: Maybe<Array<MdVerification>>;
}

export interface MdCommitInfo {
  __typename?: 'MdCommitInfo';
  sha?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
}

export interface MdConstraint {
  __typename?: 'MdConstraint';
  type: Scalars['String'];
  status: MdConstraintStatus;
  startedAt?: Maybe<Scalars['InstantTime']>;
  judgedAt?: Maybe<Scalars['InstantTime']>;
  judgedBy?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  attributes?: Maybe<Scalars['JSON']>;
}

export type MdConstraintStatus = 'PENDING' | 'PASS' | 'FAIL' | 'FORCE_PASS';

export interface MdConstraintStatusUpdate {
  type: Scalars['String'];
  artifactVersion: Scalars['String'];
  artifactReference: Scalars['String'];
  status: MdConstraintStatus;
}

export interface MdEnvironment {
  __typename?: 'MdEnvironment';
  id: Scalars['String'];
  name: Scalars['String'];
  state: MdEnvironmentState;
}

export interface MdEnvironmentState {
  __typename?: 'MdEnvironmentState';
  id: Scalars['String'];
  resources?: Maybe<Array<MdResource>>;
  artifacts?: Maybe<Array<MdArtifact>>;
}

export interface MdGitMetadata {
  __typename?: 'MdGitMetadata';
  commit?: Maybe<Scalars['String']>;
  author?: Maybe<Scalars['String']>;
  project?: Maybe<Scalars['String']>;
  branch?: Maybe<Scalars['String']>;
  repoName?: Maybe<Scalars['String']>;
  pullRequest?: Maybe<MdPullRequest>;
  commitInfo?: Maybe<MdCommitInfo>;
}

export type MdLifecycleEventScope = 'PRE_DEPLOYMENT';

export type MdLifecycleEventStatus = 'NOT_STARTED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'ABORTED' | 'UNKNOWN';

export type MdLifecycleEventType = 'BAKE' | 'BUILD';

export interface MdLifecycleStep {
  __typename?: 'MdLifecycleStep';
  scope?: Maybe<MdLifecycleEventScope>;
  type: MdLifecycleEventType;
  id?: Maybe<Scalars['String']>;
  status: MdLifecycleEventStatus;
  text?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
  startedAt?: Maybe<Scalars['InstantTime']>;
  completedAt?: Maybe<Scalars['InstantTime']>;
  artifactVersion?: Maybe<Scalars['String']>;
}

export interface MdLocation {
  __typename?: 'MdLocation';
  account?: Maybe<Scalars['String']>;
  regions?: Maybe<Array<Scalars['String']>>;
}

export interface MdMoniker {
  __typename?: 'MdMoniker';
  app?: Maybe<Scalars['String']>;
  stack?: Maybe<Scalars['String']>;
  detail?: Maybe<Scalars['String']>;
}

export interface MdPinnedVersion {
  __typename?: 'MdPinnedVersion';
  id: Scalars['String'];
  name: Scalars['String'];
  reference: Scalars['String'];
  version: Scalars['String'];
  gitMetadata?: Maybe<MdGitMetadata>;
  buildNumber?: Maybe<Scalars['String']>;
  pinnedAt?: Maybe<Scalars['InstantTime']>;
  pinnedBy?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
}

export interface MdPullRequest {
  __typename?: 'MdPullRequest';
  number?: Maybe<Scalars['String']>;
  link?: Maybe<Scalars['String']>;
}

export interface MdResource {
  __typename?: 'MdResource';
  id: Scalars['String'];
  kind: Scalars['String'];
  moniker?: Maybe<MdMoniker>;
  state?: Maybe<MdResourceActuationState>;
  artifact?: Maybe<MdArtifact>;
  displayName?: Maybe<Scalars['String']>;
  location?: Maybe<MdLocation>;
}

export interface MdResourceActuationState {
  __typename?: 'MdResourceActuationState';
  status: MdResourceActuationStatus;
  reason?: Maybe<Scalars['String']>;
  event?: Maybe<Scalars['String']>;
}

export type MdResourceActuationStatus = 'PROCESSING' | 'UP_TO_DATE' | 'ERROR' | 'WAITING' | 'NOT_MANAGED';

export interface MdVerification {
  __typename?: 'MdVerification';
  id: Scalars['String'];
  type: Scalars['String'];
  status: MdVerificationStatus;
  startedAt?: Maybe<Scalars['InstantTime']>;
  completedAt?: Maybe<Scalars['InstantTime']>;
  link?: Maybe<Scalars['String']>;
}

export type MdVerificationStatus = 'NOT_EVALUATED' | 'PENDING' | 'PASS' | 'FAIL' | 'FORCE_PASS';

export interface Mutation {
  __typename?: 'Mutation';
  updateConstraintStatus?: Maybe<Scalars['Boolean']>;
}

export interface MutationUpdateConstraintStatusArgs {
  application?: Maybe<Scalars['String']>;
  environment?: Maybe<Scalars['String']>;
  status?: Maybe<MdConstraintStatusUpdate>;
}

export interface Query {
  __typename?: 'Query';
  application?: Maybe<MdApplication>;
}

export interface QueryApplicationArgs {
  appName: Scalars['String'];
}

export type FetchApplicationQueryVariables = Exact<{
  appName: Scalars['String'];
  statuses?: Maybe<Array<MdArtifactStatusInEnvironment> | MdArtifactStatusInEnvironment>;
}>;

export type FetchApplicationQuery = { __typename?: 'Query' } & {
  application?: Maybe<
    { __typename?: 'MdApplication' } & Pick<MdApplication, 'id' | 'name' | 'account'> & {
        environments: Array<
          { __typename?: 'MdEnvironment' } & Pick<MdEnvironment, 'id' | 'name'> & {
              state: { __typename?: 'MdEnvironmentState' } & Pick<MdEnvironmentState, 'id'> & {
                  artifacts?: Maybe<
                    Array<
                      { __typename?: 'MdArtifact' } & Pick<
                        MdArtifact,
                        'id' | 'name' | 'environment' | 'type' | 'reference'
                      > & {
                          versions?: Maybe<
                            Array<
                              { __typename?: 'MdArtifactVersionInEnvironment' } & Pick<
                                MdArtifactVersionInEnvironment,
                                'id' | 'buildNumber' | 'version' | 'createdAt' | 'status' | 'deployedAt'
                              > & {
                                  gitMetadata?: Maybe<
                                    { __typename?: 'MdGitMetadata' } & Pick<
                                      MdGitMetadata,
                                      'commit' | 'author' | 'branch'
                                    > & {
                                        commitInfo?: Maybe<
                                          { __typename?: 'MdCommitInfo' } & Pick<
                                            MdCommitInfo,
                                            'sha' | 'link' | 'message'
                                          >
                                        >;
                                        pullRequest?: Maybe<
                                          { __typename?: 'MdPullRequest' } & Pick<MdPullRequest, 'number' | 'link'>
                                        >;
                                      }
                                  >;
                                  lifecycleSteps?: Maybe<
                                    Array<
                                      { __typename?: 'MdLifecycleStep' } & Pick<
                                        MdLifecycleStep,
                                        'startedAt' | 'completedAt' | 'type' | 'status' | 'link'
                                      >
                                    >
                                  >;
                                  constraints?: Maybe<
                                    Array<
                                      { __typename?: 'MdConstraint' } & Pick<
                                        MdConstraint,
                                        'type' | 'status' | 'judgedBy' | 'attributes'
                                      >
                                    >
                                  >;
                                  verifications?: Maybe<
                                    Array<
                                      { __typename?: 'MdVerification' } & Pick<
                                        MdVerification,
                                        'id' | 'type' | 'status' | 'startedAt' | 'completedAt' | 'link'
                                      >
                                    >
                                  >;
                                }
                            >
                          >;
                          pinnedVersion?: Maybe<
                            { __typename?: 'MdPinnedVersion' } & Pick<
                              MdPinnedVersion,
                              'id' | 'version' | 'buildNumber' | 'pinnedAt' | 'pinnedBy' | 'comment'
                            > & {
                                gitMetadata?: Maybe<
                                  { __typename?: 'MdGitMetadata' } & {
                                    commitInfo?: Maybe<{ __typename?: 'MdCommitInfo' } & Pick<MdCommitInfo, 'message'>>;
                                  }
                                >;
                              }
                          >;
                        }
                    >
                  >;
                  resources?: Maybe<
                    Array<
                      { __typename?: 'MdResource' } & Pick<MdResource, 'id' | 'kind' | 'displayName'> & {
                          moniker?: Maybe<{ __typename?: 'MdMoniker' } & Pick<MdMoniker, 'app' | 'stack' | 'detail'>>;
                          location?: Maybe<{ __typename?: 'MdLocation' } & Pick<MdLocation, 'account' | 'regions'>>;
                        }
                    >
                  >;
                };
            }
        >;
      }
  >;
};

export type FetchResourceStatusQueryVariables = Exact<{
  appName: Scalars['String'];
}>;

export type FetchResourceStatusQuery = { __typename?: 'Query' } & {
  application?: Maybe<
    { __typename?: 'MdApplication' } & Pick<MdApplication, 'id' | 'name'> & {
        environments: Array<
          { __typename?: 'MdEnvironment' } & Pick<MdEnvironment, 'id' | 'name'> & {
              state: { __typename?: 'MdEnvironmentState' } & Pick<MdEnvironmentState, 'id'> & {
                  resources?: Maybe<
                    Array<
                      { __typename?: 'MdResource' } & Pick<MdResource, 'id' | 'kind'> & {
                          state?: Maybe<
                            { __typename?: 'MdResourceActuationState' } & Pick<
                              MdResourceActuationState,
                              'status' | 'reason' | 'event'
                            >
                          >;
                        }
                    >
                  >;
                };
            }
        >;
      }
  >;
};

export type UpdateConstraintMutationVariables = Exact<{
  application?: Maybe<Scalars['String']>;
  environment?: Maybe<Scalars['String']>;
  status?: Maybe<MdConstraintStatusUpdate>;
}>;

export type UpdateConstraintMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'updateConstraintStatus'>;

export const FetchApplicationDocument = gql`
  query fetchApplication($appName: String!, $statuses: [MdArtifactStatusInEnvironment!]) {
    application(appName: $appName) {
      id
      name
      account
      environments {
        id
        name
        state {
          id
          artifacts {
            id
            name
            environment
            type
            reference
            versions(statuses: $statuses) {
              id
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
                link
              }
              constraints {
                type
                status
                judgedBy
                attributes
              }
              verifications {
                id
                type
                status
                startedAt
                completedAt
                link
              }
            }
            pinnedVersion {
              id
              version
              buildNumber
              pinnedAt
              pinnedBy
              comment
              gitMetadata {
                commitInfo {
                  message
                }
              }
            }
          }
          resources {
            id
            kind
            displayName
            moniker {
              app
              stack
              detail
            }
            location {
              account
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
 *      statuses: // value for 'statuses'
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
export const FetchResourceStatusDocument = gql`
  query fetchResourceStatus($appName: String!) {
    application(appName: $appName) {
      id
      name
      environments {
        id
        name
        state {
          id
          resources {
            id
            kind
            state {
              status
              reason
              event
            }
          }
        }
      }
    }
  }
`;

/**
 * __useFetchResourceStatusQuery__
 *
 * To run a query within a React component, call `useFetchResourceStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchResourceStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchResourceStatusQuery({
 *   variables: {
 *      appName: // value for 'appName'
 *   },
 * });
 */
export function useFetchResourceStatusQuery(
  baseOptions: Apollo.QueryHookOptions<FetchResourceStatusQuery, FetchResourceStatusQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FetchResourceStatusQuery, FetchResourceStatusQueryVariables>(
    FetchResourceStatusDocument,
    options,
  );
}
export function useFetchResourceStatusLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<FetchResourceStatusQuery, FetchResourceStatusQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<FetchResourceStatusQuery, FetchResourceStatusQueryVariables>(
    FetchResourceStatusDocument,
    options,
  );
}
export type FetchResourceStatusQueryHookResult = ReturnType<typeof useFetchResourceStatusQuery>;
export type FetchResourceStatusLazyQueryHookResult = ReturnType<typeof useFetchResourceStatusLazyQuery>;
export type FetchResourceStatusQueryResult = Apollo.QueryResult<
  FetchResourceStatusQuery,
  FetchResourceStatusQueryVariables
>;
export const UpdateConstraintDocument = gql`
  mutation UpdateConstraint($application: String, $environment: String, $status: MdConstraintStatusUpdate) {
    updateConstraintStatus(application: $application, environment: $environment, status: $status)
  }
`;
export type UpdateConstraintMutationFn = Apollo.MutationFunction<
  UpdateConstraintMutation,
  UpdateConstraintMutationVariables
>;

/**
 * __useUpdateConstraintMutation__
 *
 * To run a mutation, you first call `useUpdateConstraintMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateConstraintMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateConstraintMutation, { data, loading, error }] = useUpdateConstraintMutation({
 *   variables: {
 *      application: // value for 'application'
 *      environment: // value for 'environment'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateConstraintMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateConstraintMutation, UpdateConstraintMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateConstraintMutation, UpdateConstraintMutationVariables>(
    UpdateConstraintDocument,
    options,
  );
}
export type UpdateConstraintMutationHookResult = ReturnType<typeof useUpdateConstraintMutation>;
export type UpdateConstraintMutationResult = Apollo.MutationResult<UpdateConstraintMutation>;
export type UpdateConstraintMutationOptions = Apollo.BaseMutationOptions<
  UpdateConstraintMutation,
  UpdateConstraintMutationVariables
>;
