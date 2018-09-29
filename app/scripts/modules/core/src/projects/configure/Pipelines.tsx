import { IPipeline, IProjectPipeline } from 'core/domain';

import { IWizardPageProps, wizardPage } from 'core/modal';
import { FormikErrors } from 'formik';
import * as React from 'react';
import Select from 'react-select';

import './Pipelines.css';

interface IProjectPipelineWithName extends IProjectPipeline {
  pipelineName: string;
}

export interface IPipelinesProps extends IWizardPageProps<{}> {
  appsPipelines: {
    [appName: string]: IPipeline[];
  };
  entries?: IProjectPipeline[];
}

interface IPipelinesState {
  pipelines: IProjectPipelineWithName[];
  pipelinesToShowForSelectedApp: Array<{ name: string; id: string }>;
  selectedApp: string;
}

class PipelinesImpl extends React.Component<IPipelinesProps, IPipelinesState> {
  public static LABEL = 'Pipelines';

  constructor(props: IPipelinesProps) {
    super(props);
    this.state = {
      pipelines: props.entries ? this.hydrateEntriesWithPipelineNames(props.entries) : [],
      pipelinesToShowForSelectedApp: [],
      selectedApp: null,
    };
  }

  private hydrateEntriesWithPipelineNames = (entries: IProjectPipeline[]): IProjectPipelineWithName[] => {
    return entries.map(entry => {
      const appPipelines = this.props.appsPipelines[entry.application];
      const foundPipeline = appPipelines.find(pipeline => pipeline.id === entry.pipelineConfigId);
      const pipelineName = foundPipeline && foundPipeline.name;
      return { ...entry, pipelineName };
    });
  };

  private addNewRow = () => {
    const { appsPipelines } = this.props;
    const selectedApp = Object.keys(appsPipelines)[0];

    const newRow: IProjectPipelineWithName = {
      application: selectedApp,
      pipelineConfigId: null,
      pipelineName: null,
    };
    const pipelines = this.state.pipelines.concat(newRow);

    const pipelinesToShowForSelectedApp = appsPipelines[selectedApp].map(item => ({ name: item.name, id: item.id }));

    this.setState({ pipelinesToShowForSelectedApp, selectedApp, pipelines });
  };

  private setPipelinesForApp = (selectedApp: string, idx: number) => {
    const listOfPipelinesForApp = this.props.appsPipelines[selectedApp];
    const { pipelines } = this.state;
    pipelines[idx].application = selectedApp;

    const pipelinesToShowForSelectedApp = listOfPipelinesForApp.map(({ name, id }) => ({
      name,
      id,
    }));

    this.setState({ pipelinesToShowForSelectedApp, selectedApp, pipelines });
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
    this.props.formik.setFieldValue('pipelineConfigs', pipelines);
  };

  private removePipelineEntry = (idx: number) => {
    const { pipelines } = this.state;
    pipelines.splice(idx, 1);
    this.setState({
      pipelines,
    });
    this.props.formik.setFieldValue('pipelineConfigs', pipelines);
  };

  public validate = () => {
    return {} as FormikErrors<{}>;
  };

  public render() {
    const { appsPipelines } = this.props;
    const { pipelines } = this.state;
    const hasAppsPipelines = Object.keys(appsPipelines).length;

    return (
      <div className="Pipelines vertical center">
        {hasAppsPipelines ? (
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
                            options={Object.keys(appsPipelines).map(appName => ({
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
                            options={appsPipelines[pipelineEntry.application].map(pipeline => ({
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

export const Pipelines = wizardPage(PipelinesImpl);
