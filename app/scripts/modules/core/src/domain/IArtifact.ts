export interface IArtifact {
  kind?: string; // TODO delete
  id: string;
  type?: string;
  customKind?: boolean; // TODO delete
  name?: string;
  version?: string;
  location?: string;
  reference?: string;
  metadata?: any;
  artifactAccount?: string;
  provenance?: string;
}
