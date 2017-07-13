import * as React from 'react';

import {IStage} from 'core/domain';

export interface ILabelComponentProps {
  stage: IStage;
}

export class LabelComponent extends React.Component<ILabelComponentProps> {
  public render() {
    const LabelComponent = this.props.stage.labelComponent;
    return (<div className="label-component"><LabelComponent stage={this.props.stage}/></div>);
  }
}
