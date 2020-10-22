import React from 'react';
import { MenuItem } from 'react-bootstrap';
import { $q } from 'ngimport';
import { IPromise } from 'angular';

import { Application } from 'core/application';
import { IManagedResource } from 'core/domain';
import { confirmNotManaged } from './toggleResourceManagement';

interface IManagedMenuItemProps {
  resource: IManagedResource;
  application: Application;
  onClick?: () => void;
  children: React.ReactNode;
}

export const ManagedMenuItem = ({ resource, application, onClick, children }: IManagedMenuItemProps) => {
  if (!resource) {
    return null;
  }
  const resourceIsPaused = resource.isManaged && resource.managedResourceSummary.isPaused;
  const appIsPaused = application.isManagementPaused;
  const showInterstitial = resource.isManaged && !resourceIsPaused && !appIsPaused;
  const interstitial: () => IPromise<boolean> = () =>
    showInterstitial ? confirmNotManaged(resource, application) : $q.when(true);
  const handleClick: () => void = () =>
    interstitial().then((isNotManaged) => {
      isNotManaged && onClick();
    });

  return <MenuItem onClick={handleClick}>{children}</MenuItem>;
};
