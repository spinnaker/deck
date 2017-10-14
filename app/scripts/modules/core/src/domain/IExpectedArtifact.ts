import { IArtifact } from 'core/domain/IArtifact';

export interface IExpectedArtifact {
  matchArtifact: IArtifact;
  usePriorArtifact: boolean;
  defaultArtifact: IArtifact;
}

