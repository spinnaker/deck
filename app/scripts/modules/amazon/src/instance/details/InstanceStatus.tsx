import React from 'react';

import { CollapsibleSection, InstanceLoadBalancerHealth, robotToHuman, Tooltip } from '@spinnaker/core';
import { IAmazonHealth } from '../../domain';

export type MetricTypes = 'LoadBalancer' | 'TargetGroup';

export interface IInstanceStatusProps {
  healthMetrics: IAmazonHealth[];
  healthState: string;
  metricTypes: MetricTypes[];
  privateIpAddress: string;
}

export const InstanceStatus = ({ healthMetrics, healthState, metricTypes, privateIpAddress }: IInstanceStatusProps) => {
  const hasLoadBalancer = metricTypes.includes('LoadBalancer');
  const hasTargetGroup = metricTypes.includes('TargetGroup');

  return (
    <CollapsibleSection heading="Status" defaultExpanded={true}>
      {!healthMetrics.length && (
        <p>{healthState === 'Starting' ? 'Starting' : 'No health metrics found for this instance'}</p>
      )}
      <dl className="horizontal-when-filters-collapsed">
        {healthMetrics
          .sort((a: IAmazonHealth, b: IAmazonHealth) => (a.type < b.type ? -1 : a.type > b.type ? 1 : 0))
          .map((metric: IAmazonHealth) => (
            <>
              <dt>{robotToHuman(metric.type)}</dt>
              <dd>
                {!metricTypes.includes(metric.type as MetricTypes) && (
                  <div>
                    <Tooltip value={metric.state.toLowerCase() === 'down' ? metric.description : ''} placement="left">
                      <span className="pad-left small">
                        {metric.healthCheckUrl && (
                          <a target="_blank" href={metric.healthCheckUrl}>
                            Health Check
                          </a>
                        )}
                        {metric.healthCheckUrl && metric.statusPageUrl && <span> | </span>}
                        {metric.statusPageUrl && (
                          <a target="_blank" href={metric.statusPageUrl}>
                            Status
                          </a>
                        )}
                      </span>
                    </Tooltip>
                  </div>
                )}
                {hasLoadBalancer &&
                  metric.type === 'LoadBalancer' &&
                  (metric.loadBalancers || []).map(lb => <InstanceLoadBalancerHealth loadBalancer={lb} />)}
                {hasTargetGroup &&
                  metric.type === 'TargetGroup' &&
                  (metric.targetGroups || []).map(tg => (
                    <InstanceLoadBalancerHealth loadBalancer={tg} ipAddress={privateIpAddress} />
                  ))}
              </dd>
            </>
          ))}
      </dl>
    </CollapsibleSection>
  );
};
