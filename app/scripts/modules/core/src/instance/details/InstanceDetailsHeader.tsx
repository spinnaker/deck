import React from 'react';
import { UISref } from '@uirouter/react';
import { UIRouterContextComponent } from '@uirouter/react-hybrid';
import { Spinner } from 'core/widgets/spinners/Spinner';
import { CopyToClipboard } from 'core/utils/clipboard/CopyToClipboard';
import { CloudProviderLogo } from 'core/cloudProvider/CloudProviderLogo';

import './InstanceDetailsHeader.less';

export interface IInstanceDetailsHeaderProps {
  cloudProvider?: string;
  healthState: string;
  instanceId: string;
  loading: boolean;
  sshLink?: string;
  standalone: boolean;
}
export const InstanceDetailsHeader = ({
  cloudProvider,
  healthState,
  instanceId,
  loading,
  sshLink,
  standalone,
}: IInstanceDetailsHeaderProps) => (
  <div className="InstanceDetailsHeader">
    {!standalone && (
      <div className="close-button">
        <UIRouterContextComponent>
          <UISref to="^">
            <a className="btn btn-link">
              <span className="glyphicon glyphicon-remove"></span>
            </a>
          </UISref>
        </UIRouterContextComponent>
      </div>
    )}
    {loading && (
      <div className="horizontal center spinner-container">
        <Spinner size="small" />
      </div>
    )}
    {!loading && (
      <div className="header-text horizontal middle">
        {cloudProvider && <CloudProviderLogo provider={cloudProvider} height="36px" width="36px" />}
        {!cloudProvider && <span className={`glyphicon glyphicon-hdd ${healthState}`}></span>}
        <h3 className="horizontal middle space-between flex-1">{instanceId}</h3>
        <CopyToClipboard text={sshLink || instanceId} toolTip="Copy to clipboard" />
      </div>
    )}
  </div>
);
