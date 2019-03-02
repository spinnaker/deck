import { ComponentType, SFC } from 'react';
import { IArtifactEditorProps, IArtifact } from 'core/domain';

export interface IArtifactKindConfig {
  label: string;
  type?: string;
  description: string;
  isDefault: boolean;
  editCmp?: ComponentType<IArtifactEditorProps> | SFC<IArtifactEditorProps>;
  // Legacy artifacts properties
  key: string;
  isMatch: boolean;
  controller?: (artifact: IArtifact) => void;
  controllerAs?: string;
  template?: string;
  customKind?: boolean;
}
