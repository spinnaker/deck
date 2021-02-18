import React from 'react';
import { IFormikStageConfigInjectedProps, StageConfigField, TextInput } from '@spinnaker/core';
import './style.less';

export function TagImageForm({ formik }: IFormikStageConfigInjectedProps) {
  const stage = formik.values;
  const { setFieldValue } = formik;
  const tags = stage?.tags || {};

  return (
    <div className="form-horizontal">
      <StageConfigField label="Tags">
        <>
          <div className={'tag-image-label'}>
            <div>Key</div>
            <div>Values</div>
          </div>
          <div>
            {Object.keys(tags).map((key: string, index: number) => (
              <div key={index} className={'input-group-row'}>
                <TextInput
                  value={key}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const tagsBak = { ...tags };
                    const val = (tagsBak as any)[key];
                    delete (tagsBak as any)[key];
                    (tagsBak as any)[e.target.value] = val;
                    setFieldValue('tags', tagsBak);
                  }}
                />
                <TextInput
                  value={(tags as any)[key]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const tagsBak = { ...tags };
                    (tagsBak as any)[key] = e.target.value;
                    setFieldValue('tags', tagsBak);
                  }}
                />
                <button
                  style={{ display: 'inline-block', marginLeft: '10px' }}
                  className="btn btn-sm btn-default"
                  onClick={() => {
                    const tagBak = { ...tags };
                    delete (tagBak as any)[key];
                    setFieldValue('tags', tagBak);
                  }}
                >
                  <span className="glyphicon glyphicon-trash" />
                </button>
              </div>
            ))}
            <button
              className="btn btn-block btn-add-trigger add-new"
              onClick={() => {
                setFieldValue('tags', { ...tags, '': '' });
              }}
            >
              <span className="glyphicon glyphicon-plus-sign" />
              Add Field
            </button>
          </div>
        </>
      </StageConfigField>
    </div>
  );
}
