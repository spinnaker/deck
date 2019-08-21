import * as React from 'react';
const angular = require('angular');
import { react2angular } from 'react2angular';

import {
  FormikFormField,
  IModalComponentProps,
  ChecklistInput,
  ReactModal,
  TextAreaInput,
  TaskMonitorModal,
  Application,
  robotToHuman,
} from '@spinnaker/core';

import { ITitusServerGroupDetailsSectionProps } from '../sections/ITitusServerGroupDetailsSectionProps';
import { ITitusServiceJobProcesses } from 'titus/domain/ITitusServiceJobProcesses';
import { ITitusServerGroup } from 'titus/domain';
import { enabledProcesses } from './ServiceJobProcesses';

interface IEditTitusServiceJobProcessesValues {
  serviceJobProcesses: string[];
  reason?: string;
}

interface IEditTitusServiceJobProcessesModalProps extends IModalComponentProps {
  application: Application;
  serverGroup: ITitusServerGroup;
}

const EditTitusServiceJobProcessesModal: React.SFC<IEditTitusServiceJobProcessesModalProps> = modalProps => {
  const { application, serverGroup } = modalProps;
  const { region, id: jobId, account: credentials, cloudProvider } = serverGroup;
  const enabledServiceJobProcesses = enabledProcesses(serverGroup.serviceJobProcesses);

  return (
    <TaskMonitorModal<IEditTitusServiceJobProcessesValues>
      {...modalProps}
      title={`Modify Service Job Processes for ${serverGroup.name}`}
      description={`Update Service Job Processes for ${serverGroup.name}`}
      initialValues={{ serviceJobProcesses: enabledServiceJobProcesses }}
      render={() => (
        <>
          <FormikFormField
            label="Service Job Processes"
            name="serviceJobProcesses"
            input={props => (
              <ChecklistInput
                {...props}
                options={Object.keys(serverGroup.serviceJobProcesses).map((value: string) => ({
                  value,
                  label: robotToHuman(value),
                }))}
              />
            )}
          />

          <FormikFormField
            label="Reason"
            name="reason"
            input={props => (
              <TextAreaInput
                {...props}
                rows={3}
                placeholder="(Optional) anything that might be helpful to explain the reason for this change; HTML is okay"
              />
            )}
          />
        </>
      )}
      mapValuesToTask={({
        serviceJobProcesses: checkedServiceJobProcesses,
        reason,
      }: IEditTitusServiceJobProcessesValues) => ({
        job: [
          {
            type: 'updateJobProcesses',
            serviceJobProcesses: Object.keys(serverGroup.serviceJobProcesses).reduce(
              (result, process) => {
                result[process] = checkedServiceJobProcesses.includes(process) ? true : false;
                return result;
              },
              {} as ITitusServiceJobProcesses,
            ),
            reason,
            region,
            jobId,
            credentials,
            cloudProvider,
          },
        ],
        application: application.name,
      })}
    />
  );
};

export class ServiceJobProcessesSection extends React.Component<ITitusServerGroupDetailsSectionProps> {
  private toggleServiceJobProcesses = (): void => {
    const { app: application, serverGroup } = this.props;

    ReactModal.show(EditTitusServiceJobProcessesModal, {
      application,
      serverGroup,
    } as IEditTitusServiceJobProcessesModalProps);
  };

  public render() {
    const { serviceJobProcesses } = this.props.serverGroup;
    return (
      <>
        <ul className="scaling-processes">
          {Object.keys(serviceJobProcesses).map(process => (
            <li key={process}>
              <span
                style={{ visibility: serviceJobProcesses[process] ? 'visible' : 'hidden' }}
                className="fa fa-check small"
              />
              <span className={!serviceJobProcesses[process] ? 'text-disabled' : ''}>{robotToHuman(process)} </span>
            </li>
          ))}
        </ul>
        <a className="clickable" onClick={this.toggleServiceJobProcesses}>
          Edit Service Job Processes
        </a>
      </>
    );
  }
}

export const SERVICE_JOB_PROCESSES_DETAILS_SECTION = 'spinnaker.titus.servicejobprocesses.section';

angular
  .module(SERVICE_JOB_PROCESSES_DETAILS_SECTION, [])
  .component('titusServiceJobProcessesSection', react2angular(ServiceJobProcessesSection, ['serverGroup', 'app']));
