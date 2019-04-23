import * as React from 'react';

import { CollapsibleSection, Overridable, Tooltip } from '@spinnaker/core';

import { ITencentServerGroupView, IScalingProcess } from 'tencent/domain';
import { TencentNgReact } from 'tencent/reactShims';
import { AutoScalingProcessService } from '../scalingProcesses/AutoScalingProcessService';

import { ITencentServerGroupDetailsSectionProps } from './ITencentServerGroupDetailsSectionProps';
import { CreateScalingPolicyButton } from '../scalingPolicy/CreateScalingPolicyButton';

@Overridable('aws.serverGroup.ScalingPoliciesDetailsSection')
export class ScalingPoliciesDetailsSection extends React.Component<ITencentServerGroupDetailsSectionProps> {
  constructor(props: ITencentServerGroupDetailsSectionProps) {
    super(props);
  }

  public static arePoliciesDisabled(serverGroup: ITencentServerGroupView): boolean {
    const autoScalingProcesses: IScalingProcess[] = AutoScalingProcessService.normalizeScalingProcesses(serverGroup);
    return (
      serverGroup.scalingPolicies.length > 0 &&
      autoScalingProcesses
        .filter(p => !p.enabled)
        .some(p => ['Launch', 'Terminate', 'AlarmNotification'].includes(p.name))
    );
  }

  public render(): JSX.Element {
    const { app, serverGroup } = this.props;
    const scalingPoliciesDisabled = ScalingPoliciesDetailsSection.arePoliciesDisabled(serverGroup);

    const { ScalingPolicySummary } = TencentNgReact;

    return (
      <CollapsibleSection
        cacheKey="Scaling Policies"
        heading={({ chevron }) => (
          <h4 className="collapsible-heading">
            {chevron}
            <span>
              {scalingPoliciesDisabled && (
                <Tooltip value="Some scaling processes are disabled that may prevent scaling policies from working">
                  <span className="fa fa-exclamation-circle warning-text" />
                </Tooltip>
              )}
              Scaling Policies
            </span>
          </h4>
        )}
      >
        {scalingPoliciesDisabled && (
          <div className="band band-warning">
            Some scaling processes are disabled that may prevent scaling policies from working.
          </div>
        )}
        {serverGroup.scalingPolicies.map(policy => (
          <ScalingPolicySummary
            key={policy.autoScalingPolicyId}
            policy={policy}
            serverGroup={serverGroup}
            application={app}
          />
        ))}
        <CreateScalingPolicyButton serverGroup={serverGroup} application={app} />
      </CollapsibleSection>
    );
  }
}
