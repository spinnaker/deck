import * as React from 'react';

import { IStageConfigProps, StageConfigField } from 'core/pipeline';

export class GremlinStageConfig extends React.Component<IStageConfigProps> {
  private onChange = (name: string, value: string) => {
    this.props.updateStageField({ [name]: value });
  };

  public render() {
    const { stage } = this.props;

    return (
      <div className="form-horizontal">
        <StageConfigField label="API Key">
          <input
            name="gremlinApiKey"
            className="form-control input"
            type="text"
            value={stage.gremlinApiKey}
            onChange={e => this.onChange(e.target.name, e.target.value)}
          />
        </StageConfigField>
        <StageConfigField label="Command Template ID">
          <input
            name="gremlinCommandTemplateId"
            className="form-control input"
            type="text"
            value={stage.gremlinCommandTemplateId}
            onChange={e => this.onChange(e.target.name, e.target.value)}
          />
        </StageConfigField>
        <StageConfigField label="Target Template ID">
          <input
            name="gremlinTargetTemplateId"
            className="form-control input"
            type="text"
            value={stage.gremlinTargetTemplateId}
            onChange={e => this.onChange(e.target.name, e.target.value)}
          />
        </StageConfigField>
      </div>
    );
  }
}
