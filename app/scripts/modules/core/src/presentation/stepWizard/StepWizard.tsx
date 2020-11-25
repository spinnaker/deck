import * as React from 'react';

export interface IStepWizardInjectedProps {
  currentIndex: number;
  currentStep: React.ReactNode;
  goToStep: (i: number) => void;
}

export interface IStepWizardProps {
  steps: React.ReactNode[];
  render: (props: IStepWizardInjectedProps) => React.ReactNode;
}

export const StepWizard = ({ render, steps }: IStepWizardProps) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const currentStep = steps[currentIndex];
  const goToStep = (i: number) => setCurrentIndex(i);

  return <React.Fragment>{render({ currentIndex, currentStep, goToStep })}</React.Fragment>;
};
