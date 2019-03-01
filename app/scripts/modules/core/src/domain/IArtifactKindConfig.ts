import { ComponentType, SFC } from 'react';
import { IArtifactEditorProps, IArtifact } from 'core/domain';

export interface IArtifactKindConfig {
  label: string;
  type?: string;
  description: string;
  key: string;
  isDefault: boolean;
  isMatch: boolean;
  editCmp?: ComponentType<IArtifactEditorProps> | SFC<IArtifactEditorProps>;
  // Legacy artifacts properties
  controller?: (artifact: IArtifact) => void;
  controllerAs?: string;
  template?: string;
  customKind?: boolean;
  isPubliclyAccessible?: boolean;
}
