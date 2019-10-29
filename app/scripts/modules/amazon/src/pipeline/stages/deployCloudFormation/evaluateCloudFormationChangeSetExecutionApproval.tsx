import * as React from 'react';

import { IExecution, IExecutionStage } from 'core/domain';
import { Application } from 'core/application/application.model';
import { NgReact } from '@spinnaker/core';
import { AwsReactInjector } from 'amazon/reactShims';

export interface IEvaluateCloudFormationChangeSetExecutionApprovalProps {
  execution: IExecution;
  stage: IExecutionStage;
  application: Application;
}

export interface IEvaluateCloudFormationChangeSetExecutionApprovalState {
  submitting: boolean;
  judgmentDecision: string;
  error: boolean;
}

export class EvaluateCloudFormationChangeSetExecutionApproval extends React.Component<
  IEvaluateCloudFormationChangeSetExecutionApprovalProps,
  IEvaluateCloudFormationChangeSetExecutionApprovalState
> {
  constructor(props: IEvaluateCloudFormationChangeSetExecutionApprovalProps) {
    super(props);
    this.state = {
      submitting: false,
      judgmentDecision: '',
      error: false,
    };
  }

  public provideJudgment(judgmentDecision: string): void {
    const { application, execution, stage } = this.props;
    this.setState({ submitting: true, error: false, judgmentDecision });
    AwsReactInjector.evaluateCloudFormationChangeSetExecutionService.evaluateExecution(
      application,
      execution,
      stage,
      judgmentDecision,
    );
  }

  private isSubmitting(decision: string): boolean {
    return (
      this.props.stage.context.judgmentStatus === decision ||
      (this.state.submitting && this.state.judgmentDecision === decision)
    );
  }

  private handleContinueClick = (): void => {
    this.provideJudgment('skip');
  };

  private handleFailClick = (): void => {
    this.provideJudgment('fail');
  };

  private handleStopClick = (): void => {
    this.provideJudgment('execute');
  };

  public render(): React.ReactElement<EvaluateCloudFormationChangeSetExecutionApproval> {
    const stage: IExecutionStage = this.props.stage;
    const changeSetIsReplacement = !stage.context.changeSetIsReplacement;
    const { ButtonBusyIndicator } = NgReact;

    return (
      <div>
        <div>
          <p>
            This ChangeSet contains a replacement, which means there will be <b>potential data loss</b> when executed.
          </p>
          <p>How do you want to proceed?</p>
          <div className="action-buttons">
            <button
              className="btn btn-danger"
              onClick={this.handleStopClick}
              disabled={changeSetIsReplacement || this.state.submitting}
            >
              {this.isSubmitting('Execute') && <ButtonBusyIndicator />}
              {stage.context.stopButtonLabel || 'Execute'}
            </button>
            <button
              className="btn btn-primary"
              disabled={changeSetIsReplacement || this.state.submitting}
              onClick={this.handleContinueClick}
            >
              {this.isSubmitting('Skip') && <ButtonBusyIndicator />}
              {stage.context.continueButtonLabel || 'Skip'}
            </button>
            <button
              className="btn btn-primary"
              disabled={changeSetIsReplacement || this.state.submitting}
              onClick={this.handleFailClick}
            >
              {this.isSubmitting('Fail') && <ButtonBusyIndicator />}
              {stage.context.continueButtonLabel || 'Fail'}
            </button>
          </div>
        </div>
        {this.state.error && (
          <div className="error-message">There was an error recording your decision. Please try again.</div>
        )}
      </div>
    );
  }
}
