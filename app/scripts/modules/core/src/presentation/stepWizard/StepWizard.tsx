import * as React from 'react';

export interface StepAction {
  goToNext?: (currentIndex: number) => number;
  goToPrevious?: (currentIndex: number) => number;
  primaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionType: 'Back' | 'Cancel' | 'None';
}

export interface IStepWizardInjectedProps {
  currentStep: React.ReactNode;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  primaryActionLabel?: string;
  secondaryActionType: 'Back' | 'Cancel' | 'None';
  isSubmitting: boolean;
}

export interface IStepWizardProps {
  endWizard: () => void;
  steps: React.ReactNode[];
  stepActions: StepAction[];
}

export const StepWizard = <T extends {}>(
  BaseComponent: React.ComponentType<T>,
  { endWizard, steps, stepActions }: IStepWizardProps,
): React.ComponentType<Omit<T, keyof IStepWizardInjectedProps>> => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const currentStep = steps[currentIndex];
  const currentActions = stepActions[currentIndex];
  const { goToNext, primaryAction, primaryActionLabel, secondaryActionType, goToPrevious } = currentActions;

  const goToNextStep = () => {
    if (goToNext) {
      const newStep = goToNext(currentIndex);
      setCurrentIndex(newStep);
    } else {
      if (currentIndex === steps.length - 1) {
        endWizard();
      } else {
        setCurrentIndex(currentIndex + 1);
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
      endWizard();
    }

    if (secondaryActionType === 'Back' && goToPrevious) {
      const newStep = goToPrevious(currentIndex);
      setCurrentIndex(newStep);
    }

    setCurrentIndex(currentIndex - 1);
  };

  const WrappedComponent = (props: T) => (
    <BaseComponent
      {...props}
      currentStep={currentStep}
      onPrimaryClick={onPrimaryClick}
      onSecondayClick={onSecondaryClick}
      primaryActionLabel={primaryActionLabel}
      secondaryActionType={secondaryActionType}
      isSubmitting={isSubmitting}
    />
  );

  return WrappedComponent;
};
