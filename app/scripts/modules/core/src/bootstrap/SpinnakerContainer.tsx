import * as React from 'react';
import { UIView } from '@uirouter/react';

import { ReactInjector } from '../reactShims';

import { CustomBanner } from '../header/customBanner/CustomBanner';
import { SpinnakerHeader } from '../header/SpinnakerHeader';
import { Spinner } from '../widgets/spinners/Spinner';

export interface ISpinnakerContainerProps {
  authenticating: boolean;
  routing: boolean;
}

export const SpinnakerContainer = ({ authenticating, routing }: ISpinnakerContainerProps) => {
  const HeaderComponent = ReactInjector.overrideRegistry.getComponent('spinnakerHeader') || SpinnakerHeader;

  return (
    <div className="spinnaker-container grid-container">
      {!authenticating && routing && (
        <div className="transition-overlay">
          <Spinner size="medium" />
        </div>
      )}
      <div className="navbar-inverse grid-header">
        <CustomBanner />
        <HeaderComponent />
      </div>
      <div className="spinnaker-content grid-contents">{!authenticating && <UIView name="main" />}</div>
    </div>
  );
};
