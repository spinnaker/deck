import * as React from 'react';
import Select, { Option } from 'react-select';

import { IExecution, IExecutionStage } from 'core/domain';
import { Application } from 'core/application/application.model';
import { Markdown } from 'core/presentation/Markdown';
import { NgReact, ReactInjector } from 'core/reactShims';
import { ApplicationReader } from 'core/application/service/ApplicationReader';
import { AuthenticationService } from 'core/authentication';

export interface IManualJudgmentApprovalProps {
  execution: IExecution;
  stage: IExecutionStage;
  application: Application;
}

export interface IManualJudgmentApprovalState {
  submitting: boolean;
  judgmentDecision: string;
  judgmentInput: { value?: string };
  applicationRoles: { READ?: string[], WRITE?: string[], EXECUTE?: string[] };
  appRoles: string[];
  runOnce: boolean;
  userRoles: string[];
  error: boolean;
}

export class ManualJudgmentApproval extends React.Component<
  IManualJudgmentApprovalProps,
  IManualJudgmentApprovalState
> {
  constructor(props: IManualJudgmentApprovalProps) {
    super(props);
    this.state = {
      submitting: false,
      judgmentDecision: null,
      judgmentInput: {},
      applicationRoles: {},
      appRoles: [],
      runOnce: true,
      userRoles: [],
      error: false,
    };
  }

  public componentDidMount() {
      if (this.state.runOnce) {
          const applicationName = this.props.execution.application;
          ApplicationReader.getApplicationPermissions(applicationName)
              .then(result => {
                  if (typeof result !== 'undefined') {
                      this.setState({
                          applicationRoles: result,
                          runOnce: false,
                      })
                      this.populateApplicationRoles();
                      this.isStageAuthorized();
                  }
              })
              .catch(error => this.setState({
                  error,
              }));
          this.setState({
              userRoles: AuthenticationService.getAuthenticatedUser().roles
          });
      }
  }

  private provideJudgment(judgmentDecision: string): void {
    const { application, execution, stage } = this.props;
    const judgmentInput: string = this.state.judgmentInput ? this.state.judgmentInput.value : null;
    this.setState({ submitting: true, error: false, judgmentDecision });
    ReactInjector.manualJudgmentService.provideJudgment(application, execution, stage, judgmentDecision, judgmentInput);
  }

  private isSubmitting(decision: string): boolean {
    return (
      this.props.stage.context.judgmentStatus === decision ||
      (this.state.submitting && this.state.judgmentDecision === decision)
    );
  }

  private populateApplicationRoles(): void {
      const readArray = this.state.applicationRoles['READ'] || [];
      const writeArray = this.state.applicationRoles['WRITE'] || [];
      const executeArray = this.state.applicationRoles['EXECUTE'] || [];
      const roles = readArray.concat(writeArray, executeArray);
      this.setState({
          appRoles: Array.from(new Set(roles))
      });
  }

  private isStageAuthorized(): boolean {

      let disableBtn = true;
      let usrRole;
      const stageRoles = this.props.stage.context.selectedStageRoles || [];
      const appRoles = this.state.appRoles;
      const usrRoles = this.state.userRoles;
      if (appRoles.length === 0 || stageRoles.length === 0) {
          disableBtn = false;
          return disableBtn;
      }
      for (usrRole of usrRoles) {
          if ((stageRoles.indexOf(usrRole) > -1) && (appRoles.indexOf(usrRole) > -1)) {
              disableBtn = false;
              break;
          }
      }
      return disableBtn;
  }

  private handleJudgementChanged = (option: Option): void => {
    this.setState({ judgmentInput: { value: option.value as string } });
  };

  private handleContinueClick = (): void => {
    this.provideJudgment('continue');
  };

  private handleStopClick = (): void => {
    this.provideJudgment('stop');
  };

  public render(): React.ReactElement<ManualJudgmentApproval> {
    const stage: IExecutionStage = this.props.stage,
      status: string = stage.status;

    const options: Option[] = (stage.context.judgmentInputs || []).map((o: { value: string }) => {
      return { value: o.value, label: o.value };
    });

    const showOptions =
      !['SKIPPED', 'SUCCEEDED'].includes(status) && (!stage.context.judgmentStatus || status === 'RUNNING');

    const hasInstructions = !!stage.context.instructions;
    const { ButtonBusyIndicator } = NgReact;

    return (
      <div>
        {hasInstructions && (
          <div>
            <div>
              <b>Instructions</b>
            </div>
            <Markdown message={stage.context.instructions} />
          </div>
        )}
        {showOptions && (
          <div>
            {options.length > 0 && (
              <div>
                <p>
                  <b>Judgment Input</b>
                </p>
                <Select
                  options={options}
                  clearable={false}
                  value={this.state.judgmentInput.value}
                  onChange={this.handleJudgementChanged}
                />
              </div>
            )}
            <div className="action-buttons">
              <button
                className="btn btn-danger"
                onClick={this.handleStopClick}
                disabled={
                  this.isStageAuthorized() || this.state.submitting ||
                  stage.context.judgmentStatus ||
                  (options.length && !this.state.judgmentInput.value)
                }
              >
                {this.isSubmitting('stop') && <ButtonBusyIndicator />}
                {stage.context.stopButtonLabel || 'Stop'}
              </button>
              <button
                className="btn btn-primary"
                disabled={
                  this.isStageAuthorized() || this.state.submitting ||
                  stage.context.judgmentStatus ||
                  (options.length && !this.state.judgmentInput.value)
                }
                onClick={this.handleContinueClick}
              >
                {this.isSubmitting('continue') && <ButtonBusyIndicator />}
                {stage.context.continueButtonLabel || 'Continue'}
              </button>
            </div>
          </div>
        )}
        {this.state.error && (
          <div className="error-message">There was an error recording your decision. Please try again.</div>
        )}
      </div>
    );
  }
}
