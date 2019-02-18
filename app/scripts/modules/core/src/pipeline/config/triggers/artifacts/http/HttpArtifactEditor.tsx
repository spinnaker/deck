import { singleFieldArtifactEditor } from '../singleFieldArtifactEditor';
import { IArtifactKindConfig } from 'core/domain';

export const HttpMatch: IArtifactKindConfig = {
  label: 'HTTP',
  type: 'http/file',
  description: 'An HTTP artifact.',
  key: 'http',
  isDefault: false,
  isMatch: true,
  editCmp: singleFieldArtifactEditor('name', 'http/file', 'URL', 'path/file.ext', ''),
};

export const HttpDefault: IArtifactKindConfig = {
  label: 'HTTP',
  type: 'http/file',
  description: 'An HTTP artifact.',
  key: 'http',
  isDefault: true,
  isMatch: false,
  editCmp: singleFieldArtifactEditor('name', 'http/file', 'URL', 'http://host/path/file.ext', ''),
};
