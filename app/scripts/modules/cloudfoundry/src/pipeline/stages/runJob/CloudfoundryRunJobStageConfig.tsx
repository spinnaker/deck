import * as React from 'react';
import { Observable, Subject } from 'rxjs';

import {
  AccountService,
  IAccount,
  IStageConfigProps,
  NgReact,
  SpelText,
  StageConfigField,
  StageConstants,
  TextInput,
} from '@spinnaker/core';

import { AccountRegionClusterSelector } from 'cloudfoundry/presentation';
import { set } from 'lodash';

export interface ICloudfoundryRunTaskStageConfigState {
  accounts: IAccount[];
  region: string;
}

export class CloudfoundryRunJobStageConfig extends React.Component<
  IStageConfigProps,
  ICloudfoundryRunTaskStageConfigState
> {
  private destroy$ = new Subject();

  constructor(props: IStageConfigProps) {
    super(props);
    props.stage.cloudProvider = 'cloudfoundry';
    this.state = {
      accounts: [],
      region: '',
    };
  }

  public componentDidMount(): void {
    Observable.fromPromise(AccountService.listAccounts('cloudfoundry'))
      .takeUntil(this.destroy$)
      .subscribe(accounts => this.setState({ accounts }));
    this.props.stageFieldUpdated();
  }

  public componentWillUnmount(): void {
    this.destroy$.next();
  }

  private componentUpdated = (stage: any): void => {
    this.props.updateStageField({
      credentials: stage.credentials,
      region: stage.region,
      cluster: stage.cluster,
    });
  };

  private stageFieldChanged = (fieldName: string, value: any) => {
    set(this.props.stage, fieldName, value);
    this.props.stageFieldUpdated();
    this.forceUpdate();
  };

  public render() {
    const { application, stage } = this.props;
    const { target, jobName, command, logsUrl } = stage;
    const { accounts } = this.state;
    const { TargetSelect } = NgReact;

    return (
      <div className="cloudfoundry-resize-asg-stage form-horizontal">
        <AccountRegionClusterSelector
          accounts={accounts}
          application={application}
          cloudProvider={'cloudfoundry'}
          onComponentUpdate={this.componentUpdated}
          component={stage}
          isSingleRegion={true}
        />
        <StageConfigField label="Target">
          <TargetSelect
            model={{ target }}
            options={StageConstants.TARGET_LIST}
            onChange={t => this.stageFieldChanged('target', t)}
          />
        </StageConfigField>
        <StageConfigField label="Job Name" helpKey={'cf.runJob.jobName'}>
          <TextInput
            type="text"
            className="form-control"
            onChange={e => this.stageFieldChanged('jobName', e.target.value)}
            value={jobName}
            maxLength={238}
          />
        </StageConfigField>
        <StageConfigField label="Command">
          <TextInput
            type="text"
            className="form-control"
            onChange={e => this.stageFieldChanged('command', e.target.value)}
            value={command}
          />
        </StageConfigField>
        <StageConfigField label="Logs URL" helpKey={'cf.runJob.logsUrl'}>
          <SpelText
            placeholder=""
            value={logsUrl}
            onChange={value => this.stageFieldChanged('logsUrl', value)}
            pipeline={this.props.pipeline}
            docLink={false}
          />
        </StageConfigField>
      </div>
    );
  }
}
