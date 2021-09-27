import * as React from 'react';

import {
  Application,
  CloudProviderRegistry,
  ConfirmationModalService,
  HoverablePopover,
  IServerGroup,
  ReactModal,
  robotToHuman,
} from '@spinnaker/core';

import { ScalingPolicyWriter } from './ScalingPolicyWriter';
import { IAmazonServerGroup, IScalingPolicyView } from '../../../domain';
import { AlarmSummary } from './popover/AlarmSummary';
import { StepPolicyPopoverContent } from './popover/StepPolicyPopoverContent';

export interface IStepPolicySummaryProps {
  application: Application;
  policy: IScalingPolicyView;
  serverGroup: IServerGroup;
}

export const StepPolicySummary = ({ application, policy, serverGroup }: IStepPolicySummaryProps) => {
  const provider = serverGroup.type || serverGroup.cloudProvider || 'aws';
  const providerConfig = CloudProviderRegistry.getValue(provider, 'serverGroup');

  const UpsertModalComponent = providerConfig.UpsertStepPolicyModal;

  const editPolicy = () => {
    const upsertProps = {
      app: application,
      policy,
      serverGroup,
    };

    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    ReactModal.show<typeof UpsertModalComponent>(UpsertModalComponent, upsertProps, modalProps);
  };
  const deletePolicy = () => {
    const taskMonitor = {
      application,
      title: `Deleting scaling policy ${policy.policyName}`,
    };

    const submitMethod = () => ScalingPolicyWriter.deleteScalingPolicy(application, serverGroup, policy);

    ConfirmationModalService.confirm({
      header: `Really delete ${policy.policyName}?`,
      buttonText: 'Delete scaling policy',
      account: policy.alarms.length ? serverGroup.account : null,
      taskMonitorConfig: taskMonitor,
      submitMethod: submitMethod,
    });
  };

  if (!policy.alarms?.length) {
    return <div>No alarms configured for this policy - it's safe to delete.</div>;
  }

  return (
    <div>
      <span className="label label-default">{robotToHuman(policy.policyType).toUpperCase()}</span>
      <div>
        {policy.alarms.map((a) => (
          <div key={`step-summary-${policy.policyName}`}>
            <HoverablePopover
              Component={() => (
                <StepPolicyPopoverContent policy={policy} serverGroup={serverGroup as IAmazonServerGroup} />
              )}
            >
              <AlarmSummary alarm={a} />
            </HoverablePopover>
            <div className="actions">
              <button className="btn btn-xs btn-link" onClick={editPolicy}>
                <span className="glyphicon glyphicon-cog"></span>
                <span className="sr-only">Edit policy</span>
              </button>
              <button className="btn btn-xs btn-link" onClick={deletePolicy}>
                <span className="glyphicon glyphicon-trash"></span>
                <span className="sr-only">Delete policy</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
