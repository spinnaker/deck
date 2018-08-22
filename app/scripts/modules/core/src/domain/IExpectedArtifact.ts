import { IArtifact } from 'core/domain/IArtifact';

export interface IExpectedArtifact {
  matchArtifact: IArtifact;
  usePriorArtifact: boolean;
  useDefaultArtifact: boolean;
  defaultArtifact: IArtifact;
  boundArtifact?: IArtifact;
  id: string;
}
