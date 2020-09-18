import React from 'react';
import { UISref } from '@uirouter/react';
import { UIRouterContextComponent } from '@uirouter/react-hybrid';

import { AccountTag, LabeledValue, timestamp } from '@spinnaker/core';

export interface IInstanceInformationProps {
  accountId: string;
  availabilityZone: string;
  customInfo?: React.Component;
  instanceType: string;
  launchTime: number;
  provider: string;
  region: string;
  serverGroup: string;
}

export const InstanceInformation = ({
  accountId,
  availabilityZone,
  instanceType,
  launchTime,
  provider,
  region,
  serverGroup,
}: IInstanceInformationProps) => (
  <>
    <LabeledValue label="Launched" value={launchTime ? timestamp(launchTime) : 'Unknown'} />
    <LabeledValue
      label="In"
      value={
        <div>
          <AccountTag account={accountId} />
          {availabilityZone || 'Unknown'}
        </div>
      }
    />
    <LabeledValue label="Type" value={instanceType || 'Unknown'} />
    {serverGroup && (
      <LabeledValue
        label="ServerGroup"
        value={
          <div>
            <UIRouterContextComponent>
              <UISref
                to="^.serverGroup"
                params={{
                  region,
                  accountId,
                  serverGroup,
                  provider,
                }}
              >
                <a>{serverGroup}</a>
              </UISref>
            </UIRouterContextComponent>
          </div>
        }
      />
    )}
  </>
);
