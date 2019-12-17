import React from 'react';

import { Application, ApplicationWriter } from 'core/application';
import { ReactInjector } from 'core/reactShims';
import { FirewallLabel } from 'core/securityGroup/label';

export interface IDeleteApplicationSection {
  application: Application;
}

export function DeleteApplicationSection(props: IDeleteApplicationSection) {
  const { application } = props;
  const deleteApplication = (): void => {
    const taskMonitor = {
      application,
      title: `Deleting ${application.name}`,
      hasKatoTask: false,
      onTaskComplete: () => {
        ReactInjector.$state.go('home.infrastructure');
      },
    };

    ReactInjector.confirmationModalService.confirm({
      header: `Really delete ${application.name} ?`,
      buttonText: `Delete ${application.name}`,
      provider: 'aws',
      taskMonitorConfig: taskMonitor,
      submitMethod: () => ApplicationWriter.deleteApplication(application.attributes),
    });
  };

  if (application.notFound) {
    return (
      <>
        <p>Application not found.</p>
      </>
    );
  } else if (application.hasError) {
    return (
      <>
        <p>
          Something went wrong loading <em>{application.name}</em>.
        </p>
      </>
    );
  } else {
    return Boolean(application.serverGroups.data.length) ? (
      <>
        <p>You cannot delete this application because it has server groups.</p>
      </>
    ) : (
      <>
        <p>
          Deleting the application only removes the associated metadata around the application. It will{' '}
          <strong>not</strong> delete any <FirewallLabel label="firewalls" />, load balancers, or pipeline
          configurations you may have created.
        </p>
        <button className="btn btn-link clickable" onClick={deleteApplication}>
          <span>
            <span className="glyphicon glyphicon-trash" /> Delete Application
          </span>
        </button>
      </>
    );
  }
}
