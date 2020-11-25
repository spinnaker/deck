import * as React from 'react';

import { IModalComponentProps, ModalBody, ModalFooter, ModalHeader, StepWizard } from 'core/presentation';
import { Button } from 'core/managed/Button';
import { NgReact } from 'core/reactShims';
import { TaskMonitor } from 'core/task';

export interface IStepAction {
  goToNext?: (currentIndex: number) => number;
  goToPrevious?: (currentIndex: number) => number;
  primaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionType: 'Back' | 'Cancel' | 'None';
}

export interface IModalActionProps {
  action: IStepAction;
  currentIndex: number;
  dismissModal: () => void;
  goToStep: (i: number) => void;
  isValid?: boolean;
  isLastStep: boolean;
}

export interface IModalStepWizardProps extends IModalComponentProps {
  actions: IStepAction[];
  heading: string;
  isValid?: boolean;
  steps: React.ReactNode[];
  taskMonitor?: TaskMonitor;
}

export const ModalAction = ({
  action,
  currentIndex,
  dismissModal,
  goToStep,
  isLastStep,
  isValid,
}: IModalActionProps) => {
  const { goToNext, goToPrevious, primaryAction, primaryActionLabel, secondaryActionType } = action;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const goToNextStep = () => {
    if (goToNext) {
      const newStep = goToNext(currentIndex);
      goToStep(newStep);
    } else {
      if (isLastStep) {
        dismissModal();
      } else {
        goToStep(currentIndex + 1);
      }
    }
  };

  const onPrimaryClick = () => {
    if (primaryAction) {
      setIsSubmitting(true);
      Promise.resolve(primaryAction()).then(() => {
        setIsSubmitting(false);
        goToNextStep();
      });
    } else {
      goToNextStep();
    }
  };

  const onSecondaryClick = () => {
    if (secondaryActionType === 'Cancel' || currentIndex === 0) {
      dismissModal();
    }

    if (secondaryActionType === 'Back' && goToPrevious) {
      const newStep = goToPrevious(currentIndex);
      goToStep(newStep);
    }

    if (secondaryActionType == 'Back' && currentIndex !== 0) {
      goToStep(currentIndex - 1);
    }
  };

  return (
    <ModalFooter
      primaryActions={
        <div className="flex-container-h sp-group-margin-s-xaxis">
          {secondaryActionType !== 'None' && <Button onClick={onSecondaryClick}>{secondaryActionType}</Button>}
          <Button appearance="primary" disabled={isValid === false || isSubmitting} onClick={onPrimaryClick}>
            {!isSubmitting && (primaryActionLabel || 'Next')}
            {isSubmitting && <i className="fa fa-spinner fa-spin" />}
          </Button>
        </div>
      }
    />
  );
};

export const ModalStepWizard = ({
  actions,
  heading,
  dismissModal,
  isValid,
  steps,
  taskMonitor,
}: IModalStepWizardProps) => {
  const { TaskMonitorWrapper } = NgReact;

  return (
    <React.Fragment>
      <TaskMonitorWrapper monitor={taskMonitor} />
      <ModalHeader>{heading}</ModalHeader>
      <StepWizard
        steps={steps}
        render={({ currentIndex, currentStep, goToStep }) => (
          <React.Fragment>
            <ModalBody>{currentStep}</ModalBody>
            <ModalAction
              action={actions[currentIndex]}
              currentIndex={currentIndex}
              dismissModal={dismissModal}
              goToStep={goToStep}
              isLastStep={currentIndex === steps.length - 1}
              isValid={isValid}
            />
          </React.Fragment>
        )}
      />
    </React.Fragment>
  );
};
