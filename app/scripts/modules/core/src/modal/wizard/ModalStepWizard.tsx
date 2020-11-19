import * as React from 'react';

import {
  IModalComponentProps,
  IStepWizardInjectedProps,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StepAction,
  StepWizard,
} from 'core/presentation';
import { Button } from 'core/managed/Button';
import { NgReact } from 'core/reactShims';
import { TaskMonitor } from 'core/task';

export interface IModalStepWizardProps extends IModalComponentProps {
  heading: string;
  taskMonitor?: TaskMonitor;
  steps: React.ReactNode[];
  stepActions: StepAction[];
  isValid: boolean;
}

export interface IModalStepContentProps extends IStepWizardInjectedProps {
  isValid: boolean;
}

export const ModalStepContent = ({
  currentStep,
  onPrimaryClick,
  onSecondaryClick,
  primaryActionLabel,
  secondaryActionType,
  isSubmitting,
  isValid,
}: IModalStepContentProps) => (
  <>
    <ModalBody>{currentStep}</ModalBody>
    <ModalFooter
      primaryActions={
        <div className="flex-container-h sp-group-margin-s-xaxis">
          {secondaryActionType !== 'None' && <Button onClick={onSecondaryClick}>{secondaryActionType}</Button>}
          <Button appearance="primary" disabled={!isValid || isSubmitting} onClick={onPrimaryClick}>
            {!isSubmitting && (primaryActionLabel || 'Next')}
            {isSubmitting && <i className="fa fa-spinner fa-spin" />}
          </Button>
        </div>
      }
    />
  </>
);

export const ModalStepWizard = ({
  heading,
  dismissModal,
  steps,
  stepActions,
  taskMonitor,
  isValid,
}: IModalStepWizardProps) => {
  const wizardProps = {
    endWizard: dismissModal,
    steps,
    stepActions,
  };
  const WrappedModalStepContent = StepWizard(ModalStepContent, wizardProps);
  const { TaskMonitorWrapper } = NgReact;

  return (
    <React.Fragment>
      <TaskMonitorWrapper monitor={taskMonitor} />
      <ModalHeader>{heading}</ModalHeader>
      <WrappedModalStepContent isValid={isValid} />
    </React.Fragment>
  );
};
