import * as React from 'react';

import { API } from '@spinnaker/core';
import { IStageConfigProps, StageConfigField } from 'core/pipeline';
import { Observable } from 'rxjs';
import Select from 'react-select';

export class GremlinStageConfig extends React.Component<IStageConfigProps> {
  public state = { isFetchingData: false, commands: [], targets: [] };

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

    this.setState({
      isFetchingData: true,
    });

    // Get the data from all the necessary sources before rendering
    Observable.forkJoin(this.fetchCommands(gremlinApiKey), this.fetchTargets(gremlinApiKey)).subscribe(results => {
      this.setState({
        commands: results[0],
        targets: results[1],
        isFetchingData: false,
      });
    });
  };

  private onChange = (name: string, value: string) => {
    this.props.updateStageField({ [name]: value });
  };

  private handleGremlinCommandTemplateIdChange = (option: object) => {
    this.props.updateStageField({ gremlinCommandTemplateId: option.value });
  };

  private handleGremlinTargetTemplateIdChange = (option: object) => {
    this.props.updateStageField({ gremlinTargetTemplateId: option.value });
  };

  public render() {
    const { stage } = this.props;
    const { isFetchingData, commands, targets } = this.state;

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
          <div className="form-control-static">
            <button
              disabled={isFetchingData || !stage.gremlinApiKey ? 'disabled' : ''}
              onClick={this.fetchAPIData}
              type="button"
              className="btn btn-sm btn-default"
            >
              {isFetchingData ? 'Loading' : 'Fetch'}
            </button>
          </div>
        </StageConfigField>
        <StageConfigField label="Command Template">
          {!commands.length ? (
            isFetchingData ? (
              <p className="form-control-static">Loading...</p>
            ) : (
              <p className="form-control-static">No commands found.</p>
            )
          ) : (
            <Select
              name="gremlinCommandTemplateId"
              options={commands.map(command => ({
                label: command.name,
                value: command.guid,
              }))}
              clearable={false}
              value={stage.gremlinCommandTemplateId || null}
              onChange={this.handleGremlinCommandTemplateIdChange}
            />
          )}
        </StageConfigField>
        <StageConfigField label="Target Template">
          {!targets.length ? (
            isFetchingData ? (
              <p className="form-control-static">Loading...</p>
            ) : (
              <p className="form-control-static">No targets found.</p>
            )
          ) : (
            <Select
              name="gremlinTargetTemplateId"
              options={targets.map(target => ({
                label: target.name,
                value: target.guid,
              }))}
              clearable={false}
              value={stage.gremlinTargetTemplateId || null}
              onChange={this.handleGremlinTargetTemplateIdChange}
            />
          )}
        </StageConfigField>
      </div>
    );
  }
}
