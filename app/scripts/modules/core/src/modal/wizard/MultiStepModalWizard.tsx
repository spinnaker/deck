import * as React from 'react';

import { IModalComponentProps, ModalHeader } from 'core/presentation';
import { NgReact } from 'core/reactShims';
import { TaskMonitor } from 'core/task';

export interface IWizardInjectedProps {
  cancel: () => void;
  closeModal: () => void;
  /** Increments the order of the page */
  nextIdx: () => number;
  setIndex: (i: number) => void;
}

export interface IMultiStepModalWizardProps extends IModalComponentProps {
  heading: string;
  render: (props: IWizardInjectedProps) => React.ReactNode[];
  taskMonitor?: TaskMonitor;
}

export const MultiStepModalWizard = ({
  closeModal,
  dismissModal,
  heading,
  render,
  taskMonitor,
}: IMultiStepModalWizardProps) => {
  const { TaskMonitorWrapper } = NgReact;
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const incrementer = () => {
    let idx = 0;
    return () => idx++;
  };

  const cancel = () => {
    dismissModal();
  };

  const renderCurrentStep = () => {
    const nextIdx = incrementer();
    const steps = render({ cancel, closeModal, setIndex: setCurrentIndex, nextIdx });
    return steps[currentIndex];
  };

  return (
    <>
      <TaskMonitorWrapper monitor={taskMonitor} />
      <ModalHeader>{heading}</ModalHeader>
      {renderCurrentStep()}
    </>
  );
};
