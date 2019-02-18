import * as React from 'react';

import { IArtifact, IArtifactEditorProps, IArtifactKindConfig, IPipeline } from 'core/domain';
import { SpelText } from 'core/widgets';

const input = (artifact: IArtifact, field: keyof IArtifact, pipeline: IPipeline, onChange: (a: IArtifact) => void) => (
  <SpelText
    placeholder={''}
    value={artifact[field] || ''}
    onChange={(value: string) => onChange({ ...artifact, type: 'custom', [field]: value })}
    pipeline={pipeline}
    docLink={false}
  />
);

export const CustomMatch: IArtifactKindConfig = {
  label: 'Custom',
  description: 'A custom-defined artifact.',
  key: 'custom',
  isDefault: true,
  isMatch: true,
  editCmp: (props: IArtifactEditorProps) => {
    const { artifact, onChange, pipeline } = props;
    return (
      <>
        <div className="form-group row">
          <label className="col-md-2 sm-label-right">Type</label>
          <div className="col-md-3">{input(artifact, 'type', pipeline, onChange)}</div>
          <label className="col-md-2 sm-label-right">Name</label>
          <div className="col-md-3">{input(artifact, 'name', pipeline, onChange)}</div>
        </div>
        <div className="form-group row">
          <label className="col-md-2 sm-label-right">Version</label>
          <div className="col-md-3">{input(artifact, 'version', pipeline, onChange)}</div>
          <label className="col-md-2 sm-label-right">Location</label>
          <div className="col-md-3">{input(artifact, 'location', pipeline, onChange)}</div>
        </div>
        <div className="form-group row">
          <label className="col-md-2 sm-label-right">Reference</label>
          <div className="col-md-8">{input(artifact, 'reference', pipeline, onChange)}</div>
        </div>
      </>
    );
  },
};
