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
  id: Scalars['String'];
  name: Scalars['String'];
  account: Scalars['String'];
  environments: Array<DgsEnvironment>;
}

export interface DgsArtifact {
  __typename?: 'DgsArtifact';
  id: Scalars['String'];
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
  id: Scalars['String'];
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

export type DgsConstraintStatus = 'PENDING' | 'PASS' | 'FAIL' | 'FORCE_PASS';

export interface DgsConstraintStatusUpdate {
  type: Scalars['String'];
  artifactVersion: Scalars['String'];
  artifactReference?: Maybe<Scalars['String']>;
  status?: Maybe<DgsConstraintStatus>;
}

export interface DgsEnvironment {
  __typename?: 'DgsEnvironment';
  id: Scalars['String'];
  name: Scalars['String'];
  state: DgsEnvironmentState;
}

export interface DgsEnvironmentState {
  __typename?: 'DgsEnvironmentState';
  id: Scalars['String'];
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
  id: Scalars['String'];
  name: Scalars['String'];
  reference: Scalars['String'];
  version: Scalars['String'];
  gitMetadata?: Maybe<DgsGitMetadata>;
  buildNumber?: Maybe<Scalars['String']>;
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

export interface Mutation {
  __typename?: 'Mutation';
  updateConstraintStatus?: Maybe<Scalars['Boolean']>;
}

export interface MutationUpdateConstraintStatusArgs {
  application?: Maybe<Scalars['String']>;
  environment?: Maybe<Scalars['String']>;
  status?: Maybe<DgsConstraintStatusUpdate>;
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
    { __typename?: 'DgsApplication' } & Pick<DgsApplication, 'id' | 'name' | 'account'> & {
        environments: Array<
          { __typename?: 'DgsEnvironment' } & Pick<DgsEnvironment, 'id' | 'name'> & {
              state: { __typename?: 'DgsEnvironmentState' } & Pick<DgsEnvironmentState, 'id'> & {
                  artifacts?: Maybe<
                    Array<
                      { __typename?: 'DgsArtifact' } & Pick<
                        DgsArtifact,
                        'id' | 'name' | 'environment' | 'type' | 'reference'
                      > & {
                          versions?: Maybe<
                            Array<
                              { __typename?: 'DgsArtifactVersionInEnvironment' } & Pick<
                                DgsArtifactVersionInEnvironment,
                                'id' | 'buildNumber' | 'version' | 'createdAt' | 'status' | 'deployedAt'
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
                                  verifications?: Maybe<
                                    Array<
                                      { __typename?: 'DgsVerification' } & Pick<
                                        DgsVerification,
                                        'id' | 'type' | 'status' | 'startedAt' | 'completedAt' | 'link'
                                      >
                                    >
                                  >;
                                }
                            >
                          >;
                          pinnedVersion?: Maybe<
                            { __typename?: 'DgsPinnedVersion' } & Pick<
                              DgsPinnedVersion,
                              'id' | 'version' | 'buildNumber' | 'pinnedAt' | 'pinnedBy' | 'comment'
                            > & {
                                gitMetadata?: Maybe<
                                  { __typename?: 'DgsGitMetadata' } & {
                                    commitInfo?: Maybe<
                                      { __typename?: 'DgsCommitInfo' } & Pick<DgsCommitInfo, 'message'>
                                    >;
                                  }
                                >;
                              }
                          >;
                        }
                    >
                  >;
                  resources?: Maybe<
                    Array<
                      { __typename?: 'DgsResource' } & Pick<DgsResource, 'id' | 'kind' | 'displayName'> & {
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

export type FetchResourceStatusQueryVariables = Exact<{
  appName: Scalars['String'];
}>;

export type FetchResourceStatusQuery = { __typename?: 'Query' } & {
  application?: Maybe<
    { __typename?: 'DgsApplication' } & Pick<DgsApplication, 'id' | 'name'> & {
        environments: Array<
          { __typename?: 'DgsEnvironment' } & Pick<DgsEnvironment, 'id' | 'name'> & {
              state: { __typename?: 'DgsEnvironmentState' } & Pick<DgsEnvironmentState, 'id'> & {
                  resources?: Maybe<
                    Array<{ __typename?: 'DgsResource' } & Pick<DgsResource, 'id' | 'kind' | 'status'>>
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
  status?: Maybe<DgsConstraintStatusUpdate>;
}>;

export type UpdateConstraintMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'updateConstraintStatus'>;

export const FetchApplicationDocument = gql`
  query fetchApplication($appName: String!) {
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
            versions(statuses: [PENDING, APPROVED, DEPLOYING, CURRENT]) {
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
              }
              constraints {
                type
                status
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
            status
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
  mutation UpdateConstraint($application: String, $environment: String, $status: DgsConstraintStatusUpdate) {
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
