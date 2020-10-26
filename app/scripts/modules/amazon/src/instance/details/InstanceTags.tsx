import React from 'react';
import _orderBy from 'lodash/orderBy';

import { CollapsibleSection, LabeledValue } from '@spinnaker/core';

export interface IInstanceTagsProps {
  tags: Array<{
    key: string;
    value: string;
  }>;
}

export const InstanceTags = ({ tags }: IInstanceTagsProps) => {
  const sortedTags = _orderBy(tags, ['key'], ['asc']);
  return (
    <CollapsibleSection heading="Tags" defaultExpanded={true}>
      {!tags.length && <div>No tags associated with this server</div>}
      {tags.length && sortedTags.map((tag) => <LabeledValue label={tag.key} value={tag.value} />)}
    </CollapsibleSection>
  );
};
