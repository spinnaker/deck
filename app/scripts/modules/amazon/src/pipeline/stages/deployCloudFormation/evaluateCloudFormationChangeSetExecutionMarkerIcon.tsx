import * as React from 'react';
import { IExecutionMarkerIconProps } from 'core/pipeline/config/stages/common/ExecutionMarkerIcon';

export class EvaluateCloudFormationChangeSetExecutionMarkerIcon extends React.Component<IExecutionMarkerIconProps> {
  constructor(props: IExecutionMarkerIconProps) {
    super(props);
  }

  public render() {
    if (
      this.props.stage.isRunning &&
      this.props.stage.stages[0].context.changeSetIsReplacement &&
      this.props.stage.stages[0].context.actionOnReplacement === 'ask'
    ) {
      require('./evaluateCloudFormationChangeSetExecutionDetailsAsk.less');
      if (
        typeof document.getElementsByClassName('execution-marker-running stage-type-deploycloudformation')[0] !==
        'undefined'
      ) {
        document
          .getElementsByClassName('execution-marker-running stage-type-deploycloudformation')[0]
          .classList.add('stage-type-deploycloudformation-ask');
      }
      return <span className="fa fa-child" />;
    }
    return null;
  }
}
