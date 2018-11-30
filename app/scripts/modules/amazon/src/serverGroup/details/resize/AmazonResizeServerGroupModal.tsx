import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { FormikErrors, Form, Formik, FormikProps } from 'formik';
import { startCase } from 'lodash';

import {
  Application,
  HelpField,
  IServerGroupJob,
  ReactInjector,
  FormikFormField,
  TaskMonitor,
  IModalComponentProps,
  noop,
  ReactModal,
  ModalClose,
  NumberInput,
  PlatformHealthOverride,
  CheckboxInput,
  TaskReason,
  ValidationMessage,
  NgReact,
  ICapacity,
} from '@spinnaker/core';

import { AwsModalFooter } from 'amazon/common';
import { IAmazonAsg, IAmazonServerGroup } from 'amazon/domain';

export interface IAmazonResizeServerGroupModalProps extends IModalComponentProps {
  application: Application;
  serverGroup: IAmazonServerGroup;
}

export interface IAmazonResizeServerGroupModalState {
  advancedMode: boolean;
  interestingHealthProviderNames: string[]; // managed by a separate component
  initialValues: IAmazonResizeServerGroupValues;
  taskMonitor: TaskMonitor;
  platformHealthOnlyShowOverride?: boolean;
}

export interface IAmazonResizeServerGroupValues {
  min: number;
  max: number;
  desired: number;
  enforceCapacityConstraints: boolean;
  reason?: string;
}

export interface IResizeJob extends IServerGroupJob {
  constraints?: { capacity: ICapacity };
  reason?: string;
  interestingHealthProviderNames: string[];
}

interface IChangedField {
  field: keyof ICapacity;
  prevValue: number;
  value: number;
}

export class AmazonResizeServerGroupModal extends React.Component<
  IAmazonResizeServerGroupModalProps,
  IAmazonResizeServerGroupModalState
> {
  public static defaultProps: Partial<IAmazonResizeServerGroupModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  private formikRef = React.createRef<Formik<IAmazonResizeServerGroupValues>>();

  public static show(props: IAmazonResizeServerGroupModalProps): Promise<IResizeJob> {
    const modalProps = {};
    return ReactModal.show(AmazonResizeServerGroupModal, props, modalProps);
  }

  constructor(props: IAmazonResizeServerGroupModalProps) {
    super(props);

    const { minSize, maxSize, desiredCapacity } = props.serverGroup.asg;
    const { attributes } = props.application;
    this.state = {
      advancedMode: minSize !== maxSize,
      initialValues: {
        min: minSize,
        max: maxSize,
        desired: desiredCapacity,
        enforceCapacityConstraints: false,
      },
      taskMonitor: new TaskMonitor({
        application: props.application,
        title: 'Resizing your server group',
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
        onTaskComplete: () => this.props.application.serverGroups.refresh(),
      }),
      platformHealthOnlyShowOverride: attributes.platformHealthOnlyShowOverride,
      interestingHealthProviderNames:
        attributes.platformHealthOnlyShowOverride && attributes.platformHealthOnly ? ['Amazon'] : null,
    };
  }

  private getChangedFields(capacity: ICapacity, asg: IAmazonAsg): IChangedField[] {
    const fields: IChangedField[] = [
      { field: 'min', value: capacity.min, prevValue: asg.minSize },
      { field: 'max', value: capacity.max, prevValue: asg.maxSize },
      { field: 'desired', value: capacity.desired, prevValue: asg.desiredCapacity },
    ];

    return fields.filter(field => field.value !== field.prevValue);
  }

  private validate = (
    values: IAmazonResizeServerGroupValues,
  ): Partial<FormikErrors<IAmazonResizeServerGroupValues>> => {
    const { min, max, desired } = values;
    const { asg } = this.props.serverGroup;
    const errors: Partial<FormikErrors<IAmazonResizeServerGroupValues>> = {};

    if (this.getChangedFields(values, asg).length === 0) {
      (errors as any).nochange = 'no changes to capacity';
    }

    if (!this.state.advancedMode) {
      return errors;
    }

    // try to only show one error message at a time
    if (min > max && min > desired) {
      errors.min = 'Min cannot be larger than Max/Desired';
    } else if (max < min && max < desired) {
      errors.max = 'Max cannot be smaller than Min/Desired';
    } else {
      if (min > max) {
        errors.min = 'Min cannot be larger than Max';
      }
      if (!this.isDesiredControlledByAutoscaling()) {
        if (desired < min) {
          errors.desired = 'Desired cannot be smaller than Min';
        }
        if (desired > max) {
          errors.desired = 'Desired cannot be larger than Max';
        }
      }
    }

    return errors;
  };

  private toggleAdvancedMode = (): void => {
    const { desired } = this.formikRef.current.getFormikContext().values;
    this.formikRef.current.setFieldValue('min', desired);
    this.formikRef.current.setFieldValue('max', desired);
    this.setState({ advancedMode: !this.state.advancedMode });
  };

  private close = (args?: any): void => {
    this.props.dismissModal.apply(null, args);
  };

  private autoIncrementDesiredIfNeeded(): void {
    if (!this.isDesiredControlledByAutoscaling()) {
      return;
    }

    const formik = this.formikRef.current.getFormikContext();
    const { asg } = this.props.serverGroup;
    const { min, max, desired } = formik.values;
    const newDesired = Math.min(max, Math.max(min, asg.desiredCapacity));
    if (desired !== newDesired) {
      formik.setFieldValue('desired', newDesired);
    }
  }

  private platformHealthOverrideChanged = (interestingHealthProviderNames: string[]) => {
    this.setState({ interestingHealthProviderNames });
  };

  private isDesiredControlledByAutoscaling = (): boolean => {
    const { serverGroup } = this.props;
    const { suspendedProcesses } = serverGroup.asg;
    const { advancedMode } = this.state;
    const scalingPolicies = serverGroup.scalingPolicies || [];
    return (
      scalingPolicies.length && advancedMode && suspendedProcesses.every(p => p.processName !== 'AlarmNotification')
    );
  };

  private submit = (values: IAmazonResizeServerGroupValues): void => {
    const { min, max, desired, enforceCapacityConstraints, reason } = values;
    const { interestingHealthProviderNames } = this.state;
    const { serverGroup, application } = this.props;
    const { asg } = serverGroup;

    const changedFields: IChangedField[] = this.getChangedFields({ min, max, desired }, asg);
    const capacity = changedFields.reduce((acc: Partial<ICapacity>, change) => {
      return { ...acc, [change.field]: change.value };
    }, {});

    const command: IResizeJob = {
      capacity,
      reason,
      interestingHealthProviderNames,
    };

    if (enforceCapacityConstraints) {
      command.constraints = {
        capacity: {
          min: asg.minSize,
          max: asg.maxSize,
          desired: asg.desiredCapacity,
        },
      };
    }
    this.state.taskMonitor.submit(() => {
      return ReactInjector.serverGroupWriter.resizeServerGroup(serverGroup, application, command);
    });
  };

  private renderSimpleMode(formik: FormikProps<IAmazonResizeServerGroupValues>): JSX.Element {
    const { serverGroup } = this.props;
    const { asg } = serverGroup;
    return (
      <div>
        <p>Sets min, max, and desired instance counts to the same value.</p>
        <p>
          To allow autoscaling, use the{' '}
          <a className="clickable" onClick={() => this.toggleAdvancedMode()}>
            Advanced Mode
          </a>
          .
        </p>
        <div className="form-group">
          <div className="col-md-3 sm-label-right">Current size</div>
          <div className="col-md-4">
            <div className="horizontal middle">
              <input type="number" className="NumberInput form-control" value={asg.desiredCapacity} disabled={true} />
              <div className="sp-padding-xs-xaxis">instances</div>
            </div>
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-3 sm-label-right">Resize to</div>
          <div className="col-md-4">
            <div className="horizontal middle">
              <FormikFormField
                name="desired"
                input={props => <NumberInput {...props} min={0} />}
                touched={true}
                onChange={value => {
                  formik.setFieldValue('min', value);
                  formik.setFieldValue('max', value);
                }}
              />
              <div className="sp-padding-xs-xaxis">instances</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderAdvancedMode(formik: FormikProps<IAmazonResizeServerGroupValues>): JSX.Element {
    const { serverGroup } = this.props;
    const { errors } = formik;
    const { asg } = serverGroup;

    const surfacedErrorMessage: string = errors.min || errors.max || errors.desired;

    return (
      <div>
        <p>Sets up autoscaling for this server group.</p>
        <p>
          To disable autoscaling, use the{' '}
          <a className="clickable" onClick={() => this.toggleAdvancedMode()}>
            Simple Mode
          </a>
          .
        </p>
        <div className="form-group bold">
          <div className="col-md-2 col-md-offset-3">Min</div>
          <div className="col-md-2">Max</div>
          <div className="col-md-2">Desired</div>
        </div>
        <div className="form-group">
          <div className="col-md-3 sm-label-right">Current</div>
          <div className="col-md-2">
            <input type="number" className="NumberInput form-control" value={asg.minSize} disabled={true} />
          </div>
          <div className="col-md-2">
            <input type="number" className="NumberInput form-control" value={asg.maxSize} disabled={true} />
          </div>
          <div className="col-md-2">
            <input type="number" className="NumberInput form-control" value={asg.desiredCapacity} disabled={true} />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-3 sm-label-right">Resize to</div>
          <div className="col-md-2">
            <FormikFormField
              name="min"
              input={props => <NumberInput {...props} min={0} />}
              onChange={() => this.autoIncrementDesiredIfNeeded()}
              layout={({ input }) => <>{input}</>}
              touched={true}
            />
          </div>
          <div className="col-md-2">
            <FormikFormField
              name="max"
              input={props => <NumberInput {...props} min={0} />}
              onChange={() => this.autoIncrementDesiredIfNeeded()}
              layout={({ input }) => <>{input}</>}
              touched={true}
            />
          </div>
          <div className="col-md-2">
            <FormikFormField
              name="desired"
              input={props => <NumberInput {...props} min={0} disabled={this.isDesiredControlledByAutoscaling()} />}
              layout={({ input }) => <>{input}</>}
              touched={true}
            />
          </div>
        </div>

        {!!surfacedErrorMessage && (
          <div className="col-md-offset-3 col-md-9">
            <ValidationMessage message={surfacedErrorMessage} type="error" />
          </div>
        )}
      </div>
    );
  }

  private renderCapacityConstraintSelector(): JSX.Element {
    return (
      <div className="form-group">
        <div className="col-md-7 col-md-offset-3">
          <FormikFormField
            name="enforceCapacityConstraints"
            input={props => (
              <>
                <CheckboxInput {...props} text="Enforce Capacity Constraints" />
                <HelpField id="aws.serverGroup.capacityConstraint" />
              </>
            )}
          />
        </div>
      </div>
    );
  }

  private renderScalingPolicyWarning(formik: FormikProps<IAmazonResizeServerGroupValues>): JSX.Element {
    const { serverGroup } = this.props;
    const { min, max } = formik.values;
    const { advancedMode } = this.state;
    const scalingPolicies = serverGroup.scalingPolicies || [];
    if (scalingPolicies.length && min === max) {
      return (
        <div className="form-group">
          <div className="col-md-7 col-md-offset-3">
            <div className="well-compact alert alert-warning">
              <b>Warning</b>: this server group has
              {scalingPolicies.length === 1 && <span> a scaling policy. </span>}
              {scalingPolicies.length > 1 && <span> scaling policies. </span>}
              {!advancedMode && (
                <span>
                  Scaling policies will not take effect in Simple Mode. Switch to{' '}
                  <a className="clickable" onClick={() => this.toggleAdvancedMode()}>
                    Advanced Mode
                  </a>
                  .
                </span>
              )}
              {advancedMode && (
                <span>
                  Scaling policies will not take effect when <b>Min</b> is the same as <b>Max</b>.
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
    if (this.isDesiredControlledByAutoscaling()) {
      return (
        <div className="form-group">
          <div className="col-md-8 col-md-offset-1">
            <div className="well-compact alert alert-warning">
              <p>
                <b>Desired</b> capacity is managed by Autoscaling Policies.
              </p>
              <p>
                If you need to scale <b>down</b> this server group, set <b>Max</b> to the new desired size.
              </p>
              <p>
                If you need to scale <b>up</b> this server group, set <b>Min</b> to the new desired size.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  public render() {
    const { serverGroup } = this.props;
    const { advancedMode, initialValues, platformHealthOnlyShowOverride } = this.state;
    const { TaskMonitorWrapper } = NgReact;
    return (
      <>
        <TaskMonitorWrapper monitor={this.state.taskMonitor} />
        <Formik<IAmazonResizeServerGroupValues>
          ref={this.formikRef}
          initialValues={initialValues}
          validate={this.validate}
          onSubmit={this.submit}
          render={formik => {
            const { asg } = serverGroup;
            const changedCapacityFields: IChangedField[] = this.getChangedFields(formik.values, asg);

            return (
              <>
                <Modal.Header>
                  <h3>Resize {serverGroup.name}</h3>
                </Modal.Header>
                <ModalClose dismiss={this.close} />
                <Modal.Body>
                  <Form className="form-horizontal">
                    {advancedMode && this.renderAdvancedMode(formik)}
                    {!advancedMode && this.renderSimpleMode(formik)}
                    {this.renderScalingPolicyWarning(formik)}
                    {this.renderCapacityConstraintSelector()}
                    {platformHealthOnlyShowOverride && (
                      <div className="form-group">
                        <div className="col-md-8 col-md-offset-3">
                          <PlatformHealthOverride
                            interestingHealthProviderNames={this.state.interestingHealthProviderNames}
                            platformHealthType="Amazon"
                            onChange={this.platformHealthOverrideChanged}
                            showHelpDetails={true}
                          />
                        </div>
                      </div>
                    )}

                    <TaskReason reason={formik.values.reason} onChange={val => formik.setFieldValue('reason', val)} />

                    <div className="form-group">
                      <div className="col-md-3 sm-label-right">Changes</div>
                      <div className="col-md-9 sm-control-field">
                        {!changedCapacityFields.length && 'no changes'}
                        {changedCapacityFields.map(field => (
                          <div key={field.field}>
                            {startCase(field.field)}: <b>{field.prevValue}</b>{' '}
                            <i className="fa fa-long-arrow-alt-right" /> <b>{field.value}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Form>
                </Modal.Body>
                <AwsModalFooter
                  onSubmit={() => this.submit(formik.values)}
                  onCancel={this.close}
                  isValid={formik.isValid}
                  account={serverGroup.account}
                />
              </>
            );
          }}
        />
      </>
    );
  }
}
