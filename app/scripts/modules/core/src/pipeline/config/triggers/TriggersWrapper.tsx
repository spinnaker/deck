import React from 'react';

import { IPipeline } from 'core/domain';
import { ITriggersProps, Triggers } from 'core/pipeline';

export class TriggersWrapper extends React.Component<ITriggersProps> {
  private updatePipelineConfig = (changes: Partial<IPipeline>): void => {
    this.props.updatePipelineConfig(changes);
    this.forceUpdate();
  };

  public render() {
    return <Triggers {...this.props} updatePipelineConfig={this.updatePipelineConfig} />;
  }
}
