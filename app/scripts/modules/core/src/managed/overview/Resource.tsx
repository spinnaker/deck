import React from 'react';

import { useApplicationContext } from 'core/presentation';
import { IconTooltip } from 'core/presentation/IconTooltip';
import { NotifierService } from 'core/widgets';

import { useFetchResourceStatusQuery } from '../graphql/graphql-sdk';
import spinner from './loadingIndicator.svg';
import { ResourceTitle } from '../resources/ResourceTitle';
import { IResourceLinkProps, resourceManager } from '../resources/resourceRegistry';
import { QueryResource } from './types';
import { TOOLTIP_DELAY } from '../utils/defaults';

import './Resource.less';

const Status = ({
  appName,
  environmentName,
  resourceId,
}: {
  appName: string;
  environmentName: string;
  resourceId: string;
}) => {
  const { data: resourceStatuses, error, loading } = useFetchResourceStatusQuery({ variables: { appName } });
  React.useEffect(() => {
    if (error) {
      NotifierService.publish({
        action: 'create',
        key: 'md-failed-resource-status-fetch',
        content: 'Failed to fetch resource status',
        options: { type: 'error' },
      });
    }
  }, [error]);

  const currentResourceStatus = resourceStatuses?.application?.environments
    .find((env) => env.name === environmentName)
    ?.state.resources?.find((resource) => resource.id === resourceId)?.status;

  if (resourceStatuses && currentResourceStatus) {
    return <div>{currentResourceStatus}</div>;
  }
  if (error || (!loading && !currentResourceStatus)) {
    return <IconTooltip name="mdError" size="14px" tooltip="Failed to fetch resource status" />;
  }
  return <img src={spinner} height={18} />;
};

export const Resource = ({ resource, environment }: { resource: QueryResource; environment: string }) => {
  const icon = resourceManager.getIcon(resource.kind);
  const app = useApplicationContext();

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
        <IconTooltip tooltip={resource.kind} name={icon} color="primary-g1" delayShow={TOOLTIP_DELAY} />
      </div>
      <div className="row-details">
        <div className="row-title">
          <ResourceTitle props={resourceLinkProps} />
          {app && <Status appName={app.name} environmentName={environment} resourceId={resource.id} />}
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
