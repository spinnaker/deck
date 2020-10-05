import * as React from 'react';
import { UIView } from '@uirouter/react';
import { RecoilRoot } from 'recoil';

import { CustomBanner } from '../header/customBanner/CustomBanner';
import { Notifier } from '../widgets/notifier/Notifier';
import { SpinnakerHeader } from '../header/SpinnakerHeader';
import { Spinner } from '../widgets/spinners/Spinner';
import { IDeckRootScope } from '../domain';

export interface ISpinnakerContainerProps {
  $rootScope: IDeckRootScope;
}

export const SpinnakerContainer = ({ $rootScope }: ISpinnakerContainerProps) => (
  <RecoilRoot>
    <div className="spinnaker-container grid-container">
      {!$rootScope.authenticating && $rootScope.routing && (
        <div className="transition-overlay">
          <Spinner size="medium" />
        </div>
      )}
      <div className="navbar-inverse grid-header">
        <CustomBanner />
        <SpinnakerHeader />
      </div>
      <div className="spinnaker-content grid-contents">{!$rootScope.authenticating && <UIView name="main" />}</div>
    </div>
    <Notifier />
  </RecoilRoot>
);
