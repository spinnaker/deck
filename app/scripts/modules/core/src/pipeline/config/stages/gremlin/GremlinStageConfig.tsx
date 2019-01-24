import * as React from 'react';

import { API } from '@spinnaker/core';
import { IStageConfigProps, StageConfigField } from 'core/pipeline';
import { Observable } from 'rxjs';
import Select from 'react-select';

export class GremlinStageConfig extends React.Component<IStageConfigProps> {
  public ENDPOINT_COMMANDS = `${API.baseUrl}/gremlin/templates/command`;
  public ENDPOINT_TARGETS = `${API.baseUrl}/gremlin/templates/target`;

  public state = { commands: [], targets: [] };

  public componentDidMount() {
    this.checkInitialLoad();
  }

  private checkInitialLoad = () => {
    const { stage } = this.props;

    if (stage.gremlinApiKey) {
      this.fetchAPIData();
    }
  };

  private fetchCommands = apiKey => {
    return Observable.fromPromise(
      API.one('gremlin/templates/command')
        .post({
          apiKey,
        })
        .then(
          results => {
            return results;
          },
          () => {
            return [];
          },
        ),
    );
  };

  private fetchTargets = apiKey => {
    return Observable.fromPromise(
      API.one('gremlin/templates/target')
        .post({
          apiKey,
        })
        .then(
          results => {
            return results;
          },
          () => {
            return [];
          },
        ),
    );
  };

  private fetchAPIData = () => {
    const {
      stage: { gremlinApiKey },
    } = this.props;

    // Get the data from all the necessary sources before rendering
    Observable.forkJoin(this.fetchCommands(gremlinApiKey), this.fetchTargets(gremlinApiKey)).subscribe(results => {
      this.setState({
        commands: results[0],
        targets: results[1],
      });
    });
  };

  private onChange = (name: string, value: string) => {
    this.props.updateStageField({ [name]: value });
  };

  public render() {
    const { stage } = this.props;
    console.log(this.state);

    return (
      <div className="form-horizontal">
        <StageConfigField label="API Key">
          <input
            name="gremlinApiKey"
            className="form-control input"
            type="text"
            value={stage.gremlinApiKey || ''}
            onChange={e => this.onChange(e.target.name, e.target.value)}
          />
          <button onClick={this.fetchAPIData} type="button" className="btn btn-sm btn-default">
            Fetch
          </button>
        </StageConfigField>
        <StageConfigField label="Command Template">
          <input
            name="gremlinCommandTemplateId"
            className="form-control input"
            type="text"
            value={stage.gremlinCommandTemplateId || ''}
            onChange={e => this.onChange(e.target.name, e.target.value)}
          />
        </StageConfigField>
        <StageConfigField label="Target Template">
          <input
            name="gremlinTargetTemplateId"
            className="form-control input"
            type="text"
            value={stage.gremlinTargetTemplateId || ''}
            onChange={e => this.onChange(e.target.name, e.target.value)}
          />
        </StageConfigField>
      </div>
    );
  }
}
