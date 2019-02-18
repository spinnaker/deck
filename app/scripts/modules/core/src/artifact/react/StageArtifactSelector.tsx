import * as React from 'react';
import Select from 'react-select';

import { IArtifact, IExpectedArtifact, IPipeline, IStage } from 'core/domain';
import { ArtifactIcon, ExpectedArtifactService } from 'core/artifact';
import { AccountService, IArtifactAccount } from 'core/account';
import { ArtifactEditor } from './ArtifactEditor';

export interface IStageArtifactSelectorProps {
  pipeline: IPipeline;
  stage: IStage;

  // one of these two will be defined by this selector
  expectedArtifactId?: string;
  artifact?: IArtifact;

  onArtifactSelected: (expectedArtifact?: IExpectedArtifact, artifact?: IArtifact) => void;
}

export interface IStageArtifactSelectorState {
  artifactAccounts: IArtifactAccount[];
}

export class StageArtifactSelector extends React.Component<IStageArtifactSelectorProps, IStageArtifactSelectorState> {
  constructor(props: IStageArtifactSelectorProps) {
    super(props);

    this.state = {
      artifactAccounts: [],
    };
  }

  public componentDidMount(): void {
    AccountService.getArtifactAccounts().then(artifactAccounts => {
      this.setState({
        artifactAccounts: artifactAccounts,
      });
    });
  }

  private renderArtifact = (value: IExpectedArtifact) => {
    return (
      <span>
        {value.id !== '__inline.artifact__' && (
          <ArtifactIcon type={value.defaultArtifact && value.defaultArtifact.type} width="16" height="16" />
        )}
        {value && value.displayName}
      </span>
    );
  };

  private handleChange = (value: IExpectedArtifact) => {
    if (value.id === '__inline.artifact__') {
      this.props.onArtifactSelected(undefined, value.defaultArtifact);
    } else {
      this.props.onArtifactSelected(value, undefined);
    }
  };

  public render() {
    const { pipeline, stage, expectedArtifactId, artifact } = this.props;
    const expectedArtifacts = ExpectedArtifactService.getExpectedArtifactsAvailableToStage(stage, pipeline);
    const expectedArtifact = expectedArtifactId
      ? expectedArtifacts.find(a => a.id === expectedArtifactId)
      : artifact
      ? {
          id: '__inline.artifact__',
          displayName: 'Artifact from execution context',
          defaultArtifact: artifact,
        }
      : undefined;
    const inlineArtifact = ExpectedArtifactService.createEmptyArtifact();
    inlineArtifact.displayName = 'Define a new artifact...';
    inlineArtifact.id = '__inline.artifact__';
    if (artifact) {
      inlineArtifact.defaultArtifact = artifact;
    }
    const options = [inlineArtifact, ...expectedArtifacts];

    return (
      <>
        <div className="sp-margin-m-bottom">
          <Select
            clearable={false}
            options={options}
            value={expectedArtifact || artifact}
            optionRenderer={this.renderArtifact}
            valueRenderer={this.renderArtifact}
            onChange={this.handleChange}
            placeholder="Select an artifact..."
          />
        </div>
        {artifact && (
          <ArtifactEditor
            pipeline={pipeline}
            artifact={artifact}
            artifactAccounts={this.state.artifactAccounts}
            onArtifactEdit={() => this.handleChange(inlineArtifact)}
            isDefault={true}
          />
        )}
      </>
    );
  }
}
