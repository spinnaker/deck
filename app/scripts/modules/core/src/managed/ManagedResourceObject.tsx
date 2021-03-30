import { useSref } from '@uirouter/react';
import React, { memo } from 'react';

import { Application } from 'core/application';

import { getKindName } from './ManagedReader';
import { ManagedResourceStatusPopover } from './ManagedResourceStatusPopover';
import { ObjectRow } from './ObjectRow';
import { StatusBubble } from './StatusBubble';
import { IManagedResourceSummary } from '../domain/IManagedEntity';
import { viewConfigurationByStatus } from './managedResourceStatusConfig';
import { resourceManager } from './resources/resourceRegistry';

export interface IManagedResourceObjectProps {
  application: Application;
  resource: IManagedResourceSummary;
  depth?: number;
  metadata?: React.ReactNode;
}

// We'll add detail drawers for resources soon, but in the meantime let's link
// to infrastructure views for 'native' Spinnaker resources in a one-off way
// so the registry doesn't have to know about it.
const getNativeResourceRoutingInfo = (
  resource: IManagedResourceSummary,
): { state: string; params: { [key: string]: string } } | null => {
  const {
    kind,
    moniker,
    displayName,
    locations: { account },
  } = resource;
  const kindName = getKindName(kind);
  const params = {
    acct: account,
    stack: moniker?.stack ?? '(none)',
    detail: moniker?.detail ?? '(none)',
    q: displayName,
  };

  switch (kindName) {
    case 'cluster':
      return { state: 'home.applications.application.insight.clusters', params };

    case 'security-group':
      return { state: 'home.applications.application.insight.firewalls', params };

    case 'classic-load-balancer':
    case 'application-load-balancer':
      return { state: 'home.applications.application.insight.loadBalancers', params };
  }

  return null;
};

export const ManagedResourceObject = memo(({ application, resource, metadata, depth }: IManagedResourceObjectProps) => {
  const { kind, displayName } = resource;

  const routingInfo = getNativeResourceRoutingInfo(resource) ?? { state: '', params: {} };
  const routeProps = useSref(routingInfo.state, routingInfo.params);

  const displayLink = resourceManager.getExperimentalDisplayLink(resource);
  const displayLinkProps = displayLink && { href: displayLink, target: '_blank', rel: 'noopener noreferrer' };

  const linkProps = routeProps.href ? routeProps : displayLinkProps;

  const viewConfig = viewConfigurationByStatus[resource.status];

  const resourceStatus =
    resource.status !== 'HAPPY' && viewConfig ? (
      <ManagedResourceStatusPopover application={application} placement="left" resourceSummary={resource}>
        <StatusBubble appearance={viewConfig.appearance} iconName={viewConfig.iconName} size="small" />
      </ManagedResourceStatusPopover>
    ) : undefined;

  return (
    <ObjectRow
      icon={resourceManager.getIcon(kind)}
      title={linkProps ? <a {...linkProps}>{displayName}</a> : displayName}
      depth={depth}
      content={resourceStatus}
      metadata={metadata}
    />
  );
});
