import * as React from 'react';
import { get } from 'lodash';

import { IEntityTags } from 'core/domain';

export const MANAGED_BY_SPINNAKER_TAG_NAME = 'spinnaker_ui_notice:managed_by_spinnaker';

export interface IManagedResourceDetailsIndicatorProps {
  entityTags: IEntityTags[] | IEntityTags;
}

export const ManagedResourceDetailsIndicator = ({ entityTags }: IManagedResourceDetailsIndicatorProps) => {
  const normalizedTags = Array.isArray(entityTags) ? entityTags : [entityTags];
  const isManaged =
    get(normalizedTags, 'length') &&
    normalizedTags.some(({ tags }) => tags.some(({ name }) => name === MANAGED_BY_SPINNAKER_TAG_NAME));

  if (!isManaged) {
    return null;
  }
  return <div className="band band-info">Managed Declaratively 🌈</div>;
};
