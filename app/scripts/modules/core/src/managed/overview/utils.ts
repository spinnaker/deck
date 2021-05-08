import { MdArtifactStatusInEnvironment } from '../graphql/graphql-sdk';

export const DEFAULT_VERSION_STATUSES: MdArtifactStatusInEnvironment[] = [
  'PENDING',
  'APPROVED',
  'DEPLOYING',
  'CURRENT',
];
