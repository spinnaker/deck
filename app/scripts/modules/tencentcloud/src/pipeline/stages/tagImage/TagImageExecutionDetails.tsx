import React from 'react';
import { IExecutionDetailsSectionProps } from '@spinnaker/core';

TagImageExecutionDetails.title = 'Tag Image Config';
export function TagImageExecutionDetails(props: IExecutionDetailsSectionProps) {
  const tags: { [key: string]: string } = props.stage?.context?.tags || {};
  return (
    <div className="row">
      <div className="col-md-12">
        <dl className="dl-narrow dl-horizontal">
          <dt>Tags</dt>
          {Object.keys(tags).map((key: string) => (
            <dd>
              {key} = {tags[key]}
            </dd>
          ))}
        </dl>
      </div>
    </div>
  );
}
