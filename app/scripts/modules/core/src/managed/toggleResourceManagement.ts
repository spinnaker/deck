import { IManagedResource, IManagedResourceSummary, ManagedResourceStatus } from 'core/domain';
import { Application } from 'core/application';

import { ManagedWriter } from './ManagedWriter';

import './ManagedResourceStatusIndicator.less';
import { ReactInjector } from 'core/reactShims';
import { $q } from 'ngimport';

interface IToggleConfiguration {
  pauseWarning?: string;
}

const viewConfigurationByStatus: { [status in ManagedResourceStatus]?: IToggleConfiguration } = {
  ACTUATING: {
    pauseWarning: `<p>
          <div class="horizontal top sp-padding-m alert alert-warning">
            <i class="fa fa-exclamation-triangle sp-margin-m-right sp-margin-xs-top"></i>
            <span>Pausing management will not interrupt the action Spinnaker is currently performing to resolve the
            drift in configuration.</span>
          </div>
        </p>`,
  },
};

export const confirmNotManaged = (resource: IManagedResource, application: Application) => {
  const { managedResourceSummary, isManaged } = resource;
  if (!isManaged || managedResourceSummary.isPaused) {
    return $q.when();
  }
  const submitMethod = () => {
    return ManagedWriter.pauseResourceManagement(managedResourceSummary.id).then(() =>
      application.managedResources.refresh(true),
    );
  };
  return ReactInjector.confirmationModalService.confirm({
    header: `Pause Management?`,
    body: getInterstitialBodyText(managedResourceSummary),
    account: managedResourceSummary.locations.account,
    buttonText: 'Pause management',
    submitMethod,
  });
};

export const toggleResourcePause = (
  resourceSummary: IManagedResourceSummary,
  application: Application,
  hidePopover?: () => void,
) => {
  hidePopover?.();
  const { id, isPaused } = resourceSummary;
  const toggle = () =>
    isPaused ? ManagedWriter.resumeResourceManagement(id) : ManagedWriter.pauseResourceManagement(id);

  const submitMethod = () => toggle().then(() => application.managedResources.refresh(true));

  return ReactInjector.confirmationModalService.confirm({
    header: `Really ${isPaused ? 'resume' : 'pause'} resource management?`,
    body: getPopoverToggleBodyText(resourceSummary),
    account: resourceSummary.locations.account,
    buttonText: `${isPaused ? 'Resume' : 'Pause'} management`,
    submitMethod,
  });
};

const getInterstitialBodyText = (resourceSummary: IManagedResourceSummary) => {
  const { status } = resourceSummary;
  let body = `
        <p>🌈 <b>Spinnaker is continuously managing this resource.</b></p>
        <p>If you need to temporarily stop Spinnaker from managing this resource — for example, if something is wrong
        and manual intervention is required — you can pause management and resume it later.</p>`;
  body += viewConfigurationByStatus[status]?.pauseWarning ?? '';
  body += multiRegionWarning(resourceSummary);
  return body;
};

const getPopoverToggleBodyText = (resourceSummary: IManagedResourceSummary) => {
  const { isPaused, status } = resourceSummary;
  let body = '';
  if (!isPaused) {
    body += `
        <p>
          While a resource is paused, Spinnaker will not take action to resolve drift from the declarative configuration.
        </p>`;
    body += viewConfigurationByStatus[status]?.pauseWarning ?? '';
  } else {
    body += `
        <p>
          Spinnaker will resume taking action to resolve drift from the declarative configuration.
        </p>
      `;
  }
  body += multiRegionWarning(resourceSummary);
  return body;
};

const multiRegionWarning = (resourceSummary: IManagedResourceSummary) => {
  const { isPaused, locations } = resourceSummary;
  const regions = locations.regions.map(r => r.name).sort();
  if (regions.length < 2) {
    return '';
  }
  return `
    <p>
      <div class="horizontal top sp-padding-m alert alert-warning">
        <i class="fa fa-exclamation-triangle sp-margin-m-right sp-margin-xs-top"></i>
        <span>${
          isPaused ? 'Resuming' : 'Pausing'
        } management of this resource will affect the following regions: <b>${regions.join(', ')}</b>.
        </span>
      </div>
    </p>
  `;
};
