import React from 'react';

import { IconTooltip } from 'core/presentation/IconTooltip';

import { ResourceTitle } from '../resources/ResourceTitle';
import { IResourceLinkProps, resourceManager } from '../resources/resourceRegistry';
import { QueryResource } from './types';

import './Resource.less';

export const Resource = ({ resource }: { resource: QueryResource }) => {
  const icon = resourceManager.getIcon(resource.kind);

  const resourceLinkProps: IResourceLinkProps = {
    kind: resource.kind,
    displayName: resource.displayName,
    account: 'FIXME',
    detail: resource.moniker?.detail,
    stack: resource.moniker?.stack,
  };

  const regions = resource.location?.regions || [];

  return (
    <div className="Resource environment-row-element">
      <div className="row-icon">
        <IconTooltip tooltip={resource.kind} name={icon} color="primary-g1" />
      </div>
      <div className="row-details">
        <div className="row-title">
          <ResourceTitle props={resourceLinkProps} />
        </div>
        <div className="resource-regions">
          {regions.map((region, index) => (
            <span key={region}>
              {region}
              {index < regions.length - 1 && ', '}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
