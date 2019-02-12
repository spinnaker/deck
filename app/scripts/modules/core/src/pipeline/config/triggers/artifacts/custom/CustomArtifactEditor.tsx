import * as React from 'react';
import { isFinite } from 'lodash';
import { IArtifact, IArtifactEditorProps, IPipeline } from 'core/domain';
import { SpelText } from 'core/widgets/spelText/SpelText';

export const CustomArtifactEditor = (props: IArtifactEditorProps) => {
  if (props.singleColumn) {
    return SingleColumnCustomArtifactEditor(props);
  } else {
    return MultiColumnCustomArtifactEditor(props);
  }
};

const input = (artifact: IArtifact, field: keyof IArtifact, pipeline: IPipeline, onChange: (a: IArtifact) => void) => (
  <SpelText
    placeholder={''}
    value={artifact[field] || ''}
    onChange={(value: string) => onChange({ ...artifact, [field]: value })}
    pipeline={pipeline}
    docLink={false}
  />
);

const SingleColumnCustomArtifactEditor = (props: IArtifactEditorProps) => {
  const { artifact, onChange, groupClassName, pipeline } = props;
  const labelColumns = isFinite(props.labelColumns) ? props.labelColumns : 2;
  const fieldColumns = isFinite(props.fieldColumns) ? props.fieldColumns : 8;
  const labelClassName = 'col-md-' + labelColumns;
  const fieldClassName = 'col-md-' + fieldColumns;
  const formGroupClasses = groupClassName != null ? groupClassName : 'form-group row';
  return (
    <div>
      <div className={formGroupClasses}>
        <label className={labelClassName + ' sm-label-right'}>Type</label>
        <div className={fieldClassName}>{input(artifact, 'type', pipeline, onChange)}</div>
      </div>
      <div className={formGroupClasses}>
        <label className={labelClassName + ' sm-label-right'}>Name</label>
        <div className={fieldClassName}>{input(artifact, 'name', pipeline, onChange)}</div>
      </div>
      <div className={formGroupClasses}>
        <label className={labelClassName + ' sm-label-right'}>Version</label>
        <div className={fieldClassName}>{input(artifact, 'version', pipeline, onChange)}</div>
      </div>
      <div className={formGroupClasses}>
        <label className={labelClassName + ' sm-label-right'}>Location</label>
        <div className={fieldClassName}>{input(artifact, 'location', pipeline, onChange)}</div>
      </div>
      <div className={formGroupClasses}>
        <label className={labelClassName + ' sm-label-right'}>Reference</label>
        <div className={fieldClassName}>{input(artifact, 'reference', pipeline, onChange)}</div>
      </div>
    </div>
  );
};

const MultiColumnCustomArtifactEditor = (props: IArtifactEditorProps) => {
  const { artifact, onChange, groupClassName, pipeline } = props;
  const labelColumns = isFinite(props.labelColumns) ? props.labelColumns : 2;
  const fieldColumns = isFinite(props.fieldColumns) ? props.fieldColumns : 8;
  const labelClassName = 'col-md-' + labelColumns;
  const fieldClassName = 'col-md-' + fieldColumns;
  const formGroupClasses = groupClassName != null ? groupClassName : 'form-group row';
  return (
    <div>
      <div className={formGroupClasses}>
        <label className={labelClassName + ' sm-label-right'}>Type</label>
        <div className="col-md-3">{input(artifact, 'type', pipeline, onChange)}</div>
        <label className={'col-md-2 sm-label-right'}>Name</label>
        <div className="col-md-3">{input(artifact, 'name', pipeline, onChange)}</div>
      </div>
      <div className={formGroupClasses}>
        <label className={labelClassName + ' sm-label-right'}>Version</label>
        <div className="col-md-3">{input(artifact, 'version', pipeline, onChange)}</div>
        <label className={'col-md-2 sm-label-right'}>Location</label>
        <div className="col-md-3">{input(artifact, 'location', pipeline, onChange)}</div>
      </div>
      <div className={formGroupClasses}>
        <label className={labelClassName + ' sm-label-right'}>Reference</label>
        <div className={fieldClassName}>{input(artifact, 'reference', pipeline, onChange)}</div>
      </div>
    </div>
  );
};
