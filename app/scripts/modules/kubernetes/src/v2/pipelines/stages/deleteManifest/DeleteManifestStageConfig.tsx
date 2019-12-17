import React from 'react';
import { defaults } from 'lodash';

import { Application, IStage, IStageConfigProps } from '@spinnaker/core';

import { ManifestSelector } from 'kubernetes/v2/manifest/selector/ManifestSelector';
import { IManifestSelector, SelectorMode } from 'kubernetes/v2/manifest/selector/IManifestSelector';
import { IDeleteOptions } from 'kubernetes/v2/manifest/delete/delete.controller';
import DeleteManifestOptionsForm from 'kubernetes/v2/pipelines/stages/deleteManifest/DeleteManifestOptionsForm';

export interface IKubernetesManifestStageConfigProps extends IStageConfigProps {
  application: Application;
  stage: IManifestSelector & IStage;
  stageFieldUpdated: () => void;
}

export class DeleteManifestStageConfig extends React.Component<IKubernetesManifestStageConfigProps> {
  public componentDidMount = (): void => {
    defaults(this.props.stage, {
      app: this.props.application.name,
      cloudProvider: 'kubernetes',
    });
    if (this.props.stage.isNew) {
      this.props.stage.options = {
        gracePeriodSeconds: null,
        cascading: true,
      };
    }
    this.props.stageFieldUpdated();
  };

  private onChange = (stage: IManifestSelector): void => {
    Object.assign(this.props.stage, stage);
    this.props.stageFieldUpdated();
  };

  private onOptionsChange = (options: IDeleteOptions): void => {
    this.props.stage.options = options;
    this.props.stageFieldUpdated();
  };

  public render() {
    const selector = { ...this.props.stage };
    return (
      <div className="form-horizontal">
        <h4>Manifest</h4>
        <div className="horizontal-rule" />
        <ManifestSelector
          application={this.props.application}
          selector={selector}
          modes={[SelectorMode.Static, SelectorMode.Dynamic, SelectorMode.Label]}
          onChange={this.onChange}
          includeSpinnakerKinds={null}
        />
        <h4>Settings</h4>
        <div className="horizontal-rule" />
        <DeleteManifestOptionsForm onOptionsChange={this.onOptionsChange} options={this.props.stage.options} />
      </div>
    );
  }
}
