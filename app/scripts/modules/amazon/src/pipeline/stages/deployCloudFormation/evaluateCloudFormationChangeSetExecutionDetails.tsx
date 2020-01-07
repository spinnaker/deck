import * as React from 'react';

import { IExecutionDetailsSectionProps } from 'core/pipeline';
import { ExecutionDetailsSection } from '@spinnaker/core';
import { EvaluateCloudFormationChangeSetExecutionApproval } from './evaluateCloudFormationChangeSetExecutionApproval';

export class EvaluateCloudFormationChangeSetExecutionDetails extends React.Component<IExecutionDetailsSectionProps> {
  public static title = 'Change Set Execution';

  constructor(props: IExecutionDetailsSectionProps) {
    super(props);
  }

  public render() {
    const { application, execution, stage, current, name } = this.props;
    const hasReplacement = stage.context.changeSetContainsReplacement;
    if (hasReplacement && stage.isRunning && stage.context.actionOnReplacement === 'ask') {
      return (
        <ExecutionDetailsSection name={name} current={current}>
          <EvaluateCloudFormationChangeSetExecutionApproval
            key={stage.refId}
            application={application}
            execution={execution}
            stage={stage}
          />
        </ExecutionDetailsSection>
      );
    } else if (hasReplacement && !stage.isRunning && stage.context.changeSetExecutionChoice) {
      return (
        <ExecutionDetailsSection name={name} current={current}>
          <div>
            <div>
              <dl className="no-margin">
                <dt>Judgment</dt>
                <dd>{stage.context.changeSetExecutionChoice}</dd>
                <dt>Judged By</dt>
                <dd>{stage.context.lastModifiedBy}</dd>
              </dl>
            </div>
          </div>
        </ExecutionDetailsSection>
      );
    } else {
      return null;
    }
  }
}
