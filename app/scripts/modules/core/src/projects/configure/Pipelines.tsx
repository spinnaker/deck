import * as React from 'react';
import { FormikProps } from 'formik';
import { IWizardPageProps, wizardPage } from '@spinnaker/core';
import Select from 'react-select';

import './Pipelines.css';

interface IPipelinesState {
  pipelines: Map<string, string[]>;
  pipelinesToShowForSelectedApp: string[];
  selectedApp: string;
  showNewRow: boolean;
}

export interface IPipelinesProps extends FormikProps<{}> {
  appsPipelinesMap?: Map<string, string[]>;
  onChange: Function;
}

class PipelinesImpl extends React.Component<IPipelinesProps & IWizardPageProps & FormikProps<{}>, IPipelinesState> {
  public static LABEL = 'Pipelines';

  constructor(props: IPipelinesProps & IWizardPageProps & FormikProps<{}>) {
    super(props);
    this.state = {
      pipelines: new Map(),
      showNewRow: false,
      pipelinesToShowForSelectedApp: [],
      selectedApp: null,
    };
  }

  private addNewRow = () => {
    const appToShow = this.props.appsPipelinesMap.size && Array.from(this.props.appsPipelinesMap.keys())[0];

    this.setState({
      pipelinesToShowForSelectedApp: this.props.appsPipelinesMap.get(appToShow),
      selectedApp: appToShow,
      showNewRow: true,
    });
  };

  private setPipelinesForApp = (app: string) => {
    const listOfPipelinesForApp = this.props.appsPipelinesMap.get(app);
    const pipelinesSelectedForApp = (this.state.pipelines.size && this.state.pipelines.get(app)) || [];

    const listOfPipelinesNotSelected = listOfPipelinesForApp.filter(
      pipelineName => !pipelinesSelectedForApp.includes(pipelineName),
    );

    this.setState({
      pipelinesToShowForSelectedApp: listOfPipelinesNotSelected,
      selectedApp: app,
    });
  };

  private addPipeline = (pipelineName: string) => {
    const { selectedApp, pipelines } = this.state;
    const pipelinesSelectedForApp = pipelines.get(selectedApp) || [];

    if (!pipelinesSelectedForApp.includes(pipelineName)) {
      const selectedPipelinesForApp = pipelinesSelectedForApp.concat(pipelineName);
      const newSet = pipelines.set(selectedApp, selectedPipelinesForApp);

      this.setState(
        {
          pipelines: newSet,
          showNewRow: false,
        },
        () => {
          this.props.onChange(this.state.pipelines);
        },
      );
    }
  };

  private removePipeline = (app: string, pipeline: string) => {
    const { pipelines } = this.state;
    const newPipelineList = pipelines.get(app).filter(pipelineName => pipelineName !== pipeline);
    pipelines.set(app, newPipelineList);
    this.setState(
      {
        pipelines,
      },
      () => {
        this.props.onChange(this.state.pipelines);
      },
    );
  };

  private validate = (values: {}) => {
    return {};
  };

  public render() {
    const { appsPipelinesMap } = this.props;
    const { pipelines, pipelinesToShowForSelectedApp, selectedApp, showNewRow } = this.state;

    return (
      <div className="Pipelines vertical center">
        {appsPipelinesMap.size ? (
          <div className="vertical center" style={{ width: '100%' }}>
            {(pipelines.size || showNewRow) && (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <td>App</td>
                    <td>Pipeline</td>
                    <td />
                  </tr>
                </thead>
                <tbody>
                  {!!pipelines.size &&
                    Array.from(pipelines.keys()).map(appName =>
                      pipelines.get(appName).map((pipelineName: string) => (
                        <tr key={`${appName}~${pipelineName}`}>
                          <td>
                            <Select
                              options={Array.from(appsPipelinesMap.keys()).map(appName => ({
                                label: appName,
                                value: appName,
                              }))}
                              onChange={this.setPipelinesForApp}
                              value={appName}
                              className="body-small"
                            />
                          </td>
                          <td>
                            <Select
                              value={pipelineName}
                              options={pipelines.get(appName).map(pipelineName => ({
                                label: pipelineName,
                                value: pipelineName,
                              }))}
                              className="body-small"
                            />
                          </td>
                          <td>
                            <button className="nostyle" onClick={() => this.removePipeline(appName, pipelineName)}>
                              <i className="fas fa-trash-alt" />
                            </button>
                          </td>
                        </tr>
                      )),
                    )}
                  {!!showNewRow && (
                    <tr>
                      <td>
                        <Select
                          options={Array.from(appsPipelinesMap.keys()).map(appName => ({
                            label: appName,
                            value: appName,
                          }))}
                          onChange={(item: { value: string }) => this.setPipelinesForApp(item.value)}
                          value={selectedApp}
                          className="body-small"
                        />
                      </td>
                      <td>
                        <Select
                          options={pipelinesToShowForSelectedApp.map(pipelineName => ({
                            label: pipelineName,
                            value: pipelineName,
                          }))}
                          onChange={(item: { value: string }) => this.addPipeline(item.value)}
                          className="body-small"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            <button className="zombie sp-margin-m" onClick={this.addNewRow}>
              <i className="fas fa-plus-circle" /> Add Pipeline
            </button>
          </div>
        ) : (
          <div className="body-small">Select Applications</div>
        )}
      </div>
    );
  }
}

export const Pipelines = wizardPage<IPipelinesProps>(PipelinesImpl);
