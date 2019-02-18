import { singleFieldArtifactEditor } from '../singleFieldArtifactEditor';
import { IArtifactKindConfig } from 'core/domain';

export const S3Match: IArtifactKindConfig = {
  label: 'S3',
  type: 's3/object',
  description: 'An S3 object.',
  key: 's3',
  isDefault: false,
  isMatch: true,
  editCmp: singleFieldArtifactEditor(
    'name',
    's3/object',
    'Object path',
    's3://bucket/path/to/file',
    'pipeline.config.expectedArtifact.s3.name',
  ),
};

export const S3Default: IArtifactKindConfig = {
  label: 'S3',
  type: 's3/object',
  description: 'An S3 object.',
  key: 's3',
  isDefault: true,
  isMatch: false,
  editCmp: singleFieldArtifactEditor(
    'reference',
    's3/object',
    'Object path',
    's3://bucket/path/to/file',
    'pipeline.config.expectedArtifact.defaultS3.reference',
  ),
};
