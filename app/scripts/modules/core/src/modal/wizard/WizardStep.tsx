import * as React from 'react';
import { Subject } from 'rxjs';

import { ModalFooter, ModalBody } from 'core/presentation';
import { Button } from 'core/managed/Button';
import { useObservableValue } from 'core/presentation/hooks';

export interface IWizardStepInjectedProps {
  /** Optionally use this in the rendered component's validate function to capture any validation errors.
   * Ex: <MyModalStep isValid={validatorSubscription}
   *
   *  In component...
   *  validate = () => {
   *    validatorSubscription(!errors.length)
   *  }
   */
  validatorSubscription: Subject<boolean>;
}

export interface IWizardStepProps {
  cancel: () => void;
  render: (props: IWizardStepInjectedProps) => React.ReactNode;
  order: number;

  /** Some modal flows can be more like a directed graph with a starting node and one (or two) end nodes. These help navigate situations where the modal progression isn't always linear. */
  goToNext?: (currentIndex: number) => number;
  goToPrevious?: (currentIndex: number) => number;
  setIndex: (i: number) => void;

  /** The primary action is usually related to submitting the modal information. The end node must close the modal as part (or all) of its primary action */
  primaryAction?: () => void;
  primaryActionLabel?: string;

  /** These labels also have a dual purpose as types. The secondary button can either go to the previous node or dismiss the modal. To hide this button, choose 'None'. */
  secondaryActionLabel: 'Back' | 'Cancel' | 'None';
}

export const WizardStep = ({
  cancel,
  goToNext,
  goToPrevious,
  order,
  primaryAction,
  primaryActionLabel,
  render,
  secondaryActionLabel,
  setIndex,
}: IWizardStepProps) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validatorSubscription = new Subject<boolean>();
  const isStepValid = useObservableValue(validatorSubscription, true);

  const goToNextStep = () => {
    if (goToNext) {
      const newStep = goToNext(order);
      setIndex(newStep);
    } else {
      setIndex(order + 1);
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
    if (secondaryActionLabel === 'Cancel' || order === 0) {
      cancel();
    }

    if (secondaryActionLabel === 'Back' && goToPrevious) {
      const newStep = goToPrevious(order);
      setIndex(newStep);
    }

    setIndex(order - 1);
  };

  return (
    <>
      <ModalBody>{render({ validatorSubscription })}</ModalBody>
      <ModalFooter
        primaryActions={
          <div className="flex-container-h sp-group-margin-s-xaxis">
            {secondaryActionLabel !== 'None' && <Button onClick={onSecondaryClick}>{secondaryActionLabel}</Button>}
            <Button appearance="primary" disabled={!isStepValid || isSubmitting} onClick={onPrimaryClick}>
              {!isSubmitting && (primaryActionLabel || 'Next')}
              {isSubmitting && <i className="fa fa-spinner fa-spin" />}
            </Button>
          </div>
        }
      />
    </>
  );
};
