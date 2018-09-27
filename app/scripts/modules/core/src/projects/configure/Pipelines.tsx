import * as React from 'react';
import { FormikProps } from 'formik';
import { IWizardPageProps, wizardPage } from '@spinnaker/core';
import Select from 'react-select';

import './Pipelines.css';
import { IProjectPipeline } from 'domain/IProject';

interface IProjectPipelineWithName extends IProjectPipeline {
  pipelineName: string;
}

interface IPipelinesState {
  pipelines: IProjectPipelineWithName[];
  pipelinesToShowForSelectedApp: { name: string; id: string }[];
  selectedApp: string;
}

export interface IPipelinesProps extends FormikProps<{}> {
  appsPipelinesMap?: Map<string, { name: string; id: string }[]>;
  entries?: IProjectPipeline[];
}

class PipelinesImpl extends React.Component<IPipelinesProps & IWizardPageProps & FormikProps<{}>, IPipelinesState> {
  public static LABEL = 'Pipelines';

  constructor(props: IPipelinesProps & IWizardPageProps & FormikProps<{}>) {
    super(props);
    this.state = {
      pipelines: props.entries ? this.hydrateEntriesWithPipelineNames(props.entries) : [],
      pipelinesToShowForSelectedApp: [],
      selectedApp: null,
    };
  }

  private hydrateEntriesWithPipelineNames = (entries: IProjectPipeline[]): IProjectPipelineWithName[] => {
    return entries.map(entry => {
      const pipelineName = this.props.appsPipelinesMap
        .get(entry.application)
        .filter(pipeline => pipeline.id === entry.pipelineConfigId)[0].name;
      return {
        ...entry,
        pipelineName,
      };
    });
  };

  private addNewRow = () => {
    const appToShow = this.props.appsPipelinesMap.size && Array.from(this.props.appsPipelinesMap.keys())[0];

    const { pipelines } = this.state;

    pipelines.push({
      application: appToShow,
      pipelineConfigId: null,
      pipelineName: null,
    });

    this.setState({
      pipelinesToShowForSelectedApp: this.props.appsPipelinesMap
        .get(appToShow)
        .map(item => ({ name: item.name, id: item.id })),
      selectedApp: appToShow,
      pipelines,
    });
  };

  private setPipelinesForApp = (app: string, idx: number) => {
    const listOfPipelinesForApp = this.props.appsPipelinesMap.get(app);
    const { pipelines } = this.state;
    pipelines[idx].application = app;

    this.setState({
      pipelinesToShowForSelectedApp: listOfPipelinesForApp.map(({ name, id }) => ({
        name,
        id,
      })),
      selectedApp: app,
      pipelines,
    });
  };

  private updatePipelineEntry = (idx: number, application: string, pipelineConfigId: string, pipelineName: string) => {
    const { pipelines } = this.state;
    pipelines[idx] = {
      application,
      pipelineConfigId,
      pipelineName,
    };
    this.setState({
      pipelines,
    });
    this.props.setFieldValue('pipelineConfigs', pipelines);
  };

  private removePipelineEntry = (idx: number) => {
    const { pipelines } = this.state;
    pipelines.splice(idx, 1);
    this.setState({
      pipelines,
    });
    this.props.setFieldValue('pipelineConfigs', pipelines);
  };

  public validate = (): { [key: string]: string } => {
    return {};
  };

  public render() {
    const { appsPipelinesMap } = this.props;
    const { pipelines } = this.state;

    return (
      <div className="Pipelines vertical center">
        {appsPipelinesMap.size ? (
          <div className="vertical center" style={{ width: '100%' }}>
            {pipelines.length && (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <td>App</td>
                    <td>Pipeline</td>
                    <td />
                  </tr>
                </thead>
                <tbody>
                  {!!pipelines.length &&
                    pipelines.map((pipelineEntry, idx) => (
                      <tr key={`${pipelineEntry.application}~${pipelineEntry.pipelineConfigId}`}>
                        <td>
                          <Select
                            options={Array.from(appsPipelinesMap.keys()).map(appName => ({
                              label: appName,
                              value: appName,
                            }))}
                            onChange={(item: { value: string }) => this.setPipelinesForApp(item.value, idx)}
                            value={pipelineEntry.application}
                            className="body-small"
                          />
                        </td>
                        <td>
                          <Select
                            options={appsPipelinesMap.get(pipelineEntry.application).map(pipeline => ({
                              label: pipeline.name,
                              value: pipeline.id,
                            }))}
                            className="body-small"
                            onChange={(item: { label: string; value: string }) =>
                              this.updatePipelineEntry(idx, pipelineEntry.application, item.value, item.label)
                            }
                            value={pipelineEntry.pipelineConfigId}
                          />
                        </td>
                        <td>
                          <button className="nostyle" onClick={() => this.removePipelineEntry(idx)}>
                            <i className="fas fa-trash-alt" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            <a className="button zombie sp-margin-m horizontal middle center" onClick={this.addNewRow}>
              <i className="fas fa-plus-circle" /> Add Pipeline
            </a>
          </div>
        ) : (
          <div className="body-small">Select Applications</div>
        )}
      </div>
    );
  }
}

export const Pipelines = wizardPage<IPipelinesProps>(PipelinesImpl);
