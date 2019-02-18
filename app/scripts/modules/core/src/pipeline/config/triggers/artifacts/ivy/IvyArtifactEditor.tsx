import { singleFieldArtifactEditor } from '../singleFieldArtifactEditor';
import { IArtifactKindConfig } from 'core/domain';

export const IvyMatch: IArtifactKindConfig = {
  label: 'Ivy',
  type: 'ivy/file',
  description: 'An Ivy repository artifact.',
  key: 'ivy',
  isDefault: false,
  isMatch: true,
  editCmp: singleFieldArtifactEditor('name', 'ivy/file', 'Ivy Coordinate', 'group:artifact:version', ''),
};

export const IvyDefault: IArtifactKindConfig = {
  label: 'Ivy',
  type: 'ivy/file',
  description: 'An Ivy repository artifact.',
  key: 'ivy',
  isDefault: true,
  isMatch: false,
  editCmp: singleFieldArtifactEditor('name', 'ivy/file', 'Ivy Coordinate', 'group:artifact:version', ''),
};
