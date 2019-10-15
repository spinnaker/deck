import * as React from 'react';
import { Form, FormikProps } from 'formik';
import { Modal } from 'react-bootstrap';

import { IModalComponentProps, LayoutProvider, ResponsiveFieldLayout, SpinFormik } from 'core/presentation';
import { Application } from 'core/application';
import { NgReact } from 'core/reactShims';
import { SubmitButton } from 'core/modal';

import { ITaskCommand, TaskExecutor } from '../taskExecutor';
import { TaskMonitor } from '../monitor/TaskMonitor';

interface ITaskMonitorModalProps<T> extends IModalComponentProps {
  application: Application;
  title: string;
  description: string;
  render: (props: FormikProps<T>) => React.ReactNode;
  mapValuesToTask: (values: T) => ITaskCommand;
  initialValues: T;
}

interface ITaskMonitorModalState {
  taskMonitor: TaskMonitor;
  isSubmitting: boolean;
}

export class TaskMonitorModal<T> extends React.Component<ITaskMonitorModalProps<T>, ITaskMonitorModalState> {
  constructor(props: ITaskMonitorModalProps<T>) {
    super(props);
    this.state = {
      taskMonitor: null,
      isSubmitting: false,
    };
  }

  private close = (): void => {
    this.props.dismissModal();
  };

  private submitTask = (values: any) => {
    const { application, description } = this.props;
    const onClose = (result: any) => this.props.closeModal(result);
    const onDismiss = (result: any) => this.props.dismissModal(result);
    const modalInstance = TaskMonitor.modalInstanceEmulation(onClose, onDismiss);
    const taskMonitor = new TaskMonitor({
      application,
      modalInstance,
      title: description,
      onTaskComplete: () => application.serverGroups.refresh(),
    });

    const task = this.props.mapValuesToTask(values);
    task.description = this.props.description;

    const submitMethod = () => {
      const promise = TaskExecutor.executeTask(task);
      const done = () => this.setState({ isSubmitting: false });
      promise.then(done, done);
      return promise;
    };

    taskMonitor.submit(submitMethod);

    this.setState({ taskMonitor, isSubmitting: true });
  };

  public render() {
    const { isSubmitting } = this.state;
    const { TaskMonitorWrapper } = NgReact;

    const closeButton = (
      <div className="modal-close close-button pull-right">
        <a className="btn btn-link" onClick={this.close}>
          <span className="glyphicon glyphicon-remove" />
        </a>
      </div>
    );

    return (
      <div>
        <TaskMonitorWrapper monitor={this.state.taskMonitor} />

        <SpinFormik<T>
          initialValues={this.props.initialValues}
          onSubmit={this.submitTask}
          render={formik => (
            <Form className="form-horizontal">
              <Modal.Header>
                <h3>{this.props.title}</h3>
                {closeButton}
              </Modal.Header>

              <Modal.Body className="entity-tag-editor-modal">
                <LayoutProvider value={ResponsiveFieldLayout}>{this.props.render(formik)}</LayoutProvider>
              </Modal.Body>

              <Modal.Footer>
                <button className="btn btn-default" disabled={isSubmitting} onClick={this.close} type="button">
                  Cancel
                </button>
                <SubmitButton
                  isDisabled={!formik.isValid || isSubmitting}
                  submitting={isSubmitting}
                  isFormSubmit={true}
                  label="Submit"
                />
              </Modal.Footer>
            </Form>
          )}
        />
      </div>
    );
  }
}
