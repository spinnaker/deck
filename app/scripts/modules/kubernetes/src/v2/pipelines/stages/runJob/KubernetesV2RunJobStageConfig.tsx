import React from 'react';
import Select, { Option } from 'react-select';
import { map, capitalize } from 'lodash';

import {
  ArtifactTypePatterns,
  IStageConfigProps,
  AccountService,
  YamlEditor,
  yamlDocumentsToString,
  IAccount,
  StageArtifactSelector,
  SETTINGS,
  IExpectedArtifact,
  IArtifact,
  PreRewriteStageArtifactSelector,
  StageArtifactSelectorDelegate,
  StageConfigField,
  RadioButtonInput,
} from '@spinnaker/core';

import { ManifestBasicSettings } from 'kubernetes/v2/manifest/wizard/BasicSettings';
import { ManifestBindArtifactsSelectorDelegate } from '../deployManifest/ManifestBindArtifactsSelectorDelegate';
import { IManifestBindArtifact } from '../deployManifest/ManifestBindArtifactsSelector';

export interface IKubernetesRunJobStageConfigState {
  credentials: IAccount[];
  rawManifest?: string;
}

export class KubernetesV2RunJobStageConfig extends React.Component<IStageConfigProps> {
  public readonly textSource = 'text';
  public readonly artifactSource = 'artifact';
  public state: IKubernetesRunJobStageConfigState = {
    credentials: [],
  };

  private readonly excludedManifestArtifactTypes = [
    ArtifactTypePatterns.DOCKER_IMAGE,
    ArtifactTypePatterns.KUBERNETES,
    ArtifactTypePatterns.FRONT50_PIPELINE_TEMPLATE,
    ArtifactTypePatterns.MAVEN_FILE,
  ];

  constructor(props: IStageConfigProps) {
    super(props);
    const { stage, application } = this.props;
    if (!stage.application) {
      stage.application = application.name;
    }
    if (!stage.source) {
      stage.source = this.textSource;
    }
  }

  public outputOptions = [
    { label: 'None', value: 'none' },
    { label: 'Logs', value: 'propertyFile' },
    { label: 'Artifact', value: 'artifact' },
  ];

  public accountChanged = (account: string) => {
    this.props.updateStageField({
      credentials: account,
      account: account,
    });
  };

  public handleRawManifestChange = (rawManifest: string, manifests: any) => {
    if (manifests) {
      this.props.updateStageField({ manifest: manifests[0] });
    }
    this.setState({ rawManifest });
  };

  public initRawManifest() {
    const { stage } = this.props;
    if (stage.manifest) {
      this.setState({ rawManifest: yamlDocumentsToString([stage.manifest]) });
    }
  }

  public componentDidMount() {
    this.props.updateStageField({ cloudProvider: 'kubernetes' });
    AccountService.getAllAccountDetailsForProvider('kubernetes', 'v2').then((accounts: any) => {
      this.setState({ credentials: accounts });
    });
    this.initRawManifest();
  }

  private sourceChanged = (event: any) => {
    this.props.updateStageField({ consumeArtifactSource: event.value });
    if (event.value === 'none') {
      this.props.updateStageField({ propertyFile: null });
    }
  };

  private updateArtifactId(artifactId: string) {
    this.props.updateStageField({ consumeArtifactId: artifactId });
  }

  private updateArtifactAccount(artifactAccount: string) {
    this.props.updateStageField({ consumeArtifactAccount: artifactAccount });
  }

  private onArtifactSelected = (artifact: IExpectedArtifact) => {
    this.props.updateStageField({ consumeArtifactId: artifact.id });
  };

  private onArtifactEdited = (artifact: IArtifact) => {
    this.props.updateStageField({
      consumeArtifact: artifact,
      consumeArtifactId: artifact.id,
      consumeArtifactAccount: artifact.artifactAccount,
    });
  };

  private onManifestArtifactSelected = (expectedArtifactId: string): void => {
    this.props.updateStageField({
      manifestArtifactId: expectedArtifactId,
      manifestArtifact: null,
    });
  };

  private onManifestArtifactEdited = (artifact: IArtifact) => {
    this.props.updateStageField({
      manifestArtifactId: null,
      manifestArtifact: artifact,
    });
  };

  private onManifestArtifactAccountSelected = (accountName: string): void => {
    this.props.updateStageField({ manifestArtifactAccount: accountName });
  };

  private updatePropertyFile = (event: any) => {
    this.props.updateStageField({ propertyFile: event.target.value });
  };

  private checkFeatureFlag(flag: string): boolean {
    return !!SETTINGS.feature[flag];
  }

  public logSourceForm() {
    const { stage } = this.props;
    return (
      <StageConfigField label="Container Name" helpKey="kubernetes.runJob.captureSource.containerName">
        <input
          className="form-control input-sm"
          type="text"
          value={stage.propertyFile}
          onChange={this.updatePropertyFile}
        />
      </StageConfigField>
    );
  }

  public artifactRewriteForm() {
    const { stage, pipeline } = this.props;
    return (
      <StageConfigField label="Artifact">
        <StageArtifactSelector
          pipeline={pipeline}
          stage={stage}
          artifact={stage.consumeArtifact}
          excludedArtifactTypePatterns={[]}
          expectedArtifactId={stage.consumeArtifactId}
          onExpectedArtifactSelected={this.onArtifactSelected}
          onArtifactEdited={this.onArtifactEdited}
        />
      </StageConfigField>
    );
  }

  public artifactForm() {
    const { stage, pipeline } = this.props;
    return (
      <PreRewriteStageArtifactSelector
        excludedArtifactTypePatterns={[]}
        stage={stage}
        pipeline={pipeline}
        selectedArtifactId={stage.consumeArtifactId}
        selectedArtifactAccount={stage.consumeArtifactAccount}
        setArtifactAccount={(artifactAccount: string) => this.updateArtifactAccount(artifactAccount)}
        setArtifactId={(artifactId: string) => this.updateArtifactId(artifactId)}
        updatePipeline={this.props.updatePipeline}
      />
    );
  }

  private getSourceOptions = (): Array<Option<string>> => {
    return map([this.textSource, this.artifactSource], option => ({
      label: capitalize(option),
      value: option,
    }));
  };

  private getRequiredArtifacts = (): IManifestBindArtifact[] => {
    const { requiredArtifactIds, requiredArtifacts } = this.props.stage;
    return (requiredArtifactIds || [])
      .map((id: string) => ({ expectedArtifactId: id }))
      .concat(requiredArtifacts || []);
  };

  private onRequiredArtifactsChanged = (bindings: IManifestBindArtifact[]): void => {
    this.props.updateStageField({
      requiredArtifactIds: bindings.filter(b => b.expectedArtifactId).map(b => b.expectedArtifactId),
    });
    this.props.updateStageField({ requiredArtifacts: bindings.filter(b => b.artifact) });
  };

  public render() {
    const { stage } = this.props;

    let outputSource = <div />;
    if (stage.consumeArtifactSource === 'propertyFile') {
      outputSource = this.logSourceForm();
    } else if (stage.consumeArtifactSource === 'artifact') {
      outputSource = this.checkFeatureFlag('artifactsRewrite') ? this.artifactRewriteForm() : this.artifactForm();
    }

    return (
      <div className="container-fluid form-horizontal">
        <h4>Basic Settings</h4>
        <ManifestBasicSettings
          selectedAccount={stage.account || ''}
          accounts={this.state.credentials}
          onAccountSelect={(selectedAccount: string) => this.accountChanged(selectedAccount)}
        />
        <h4>Manifest Configuration</h4>
        <StageConfigField label="Manifest Source" helpKey="kubernetes.manifest.source">
          <RadioButtonInput
            options={this.getSourceOptions()}
            onChange={(e: any) => this.props.updateStageField({ source: e.target.value })}
            value={stage.source}
          />
        </StageConfigField>
        {stage.source === this.textSource && (
          <YamlEditor value={this.state.rawManifest} onChange={this.handleRawManifestChange} />
        )}
        {stage.source === this.artifactSource && (
          <>
            <StageArtifactSelectorDelegate
              artifact={stage.manifestArtifact}
              excludedArtifactTypePatterns={this.excludedManifestArtifactTypes}
              expectedArtifactId={stage.manifestArtifactId}
              helpKey="kubernetes.manifest.expectedArtifact"
              label="Manifest Artifact"
              onArtifactEdited={this.onManifestArtifactEdited}
              onExpectedArtifactSelected={(artifact: IExpectedArtifact) => this.onManifestArtifactSelected(artifact.id)}
              pipeline={this.props.pipeline}
              selectedArtifactAccount={stage.manifestArtifactAccount}
              selectedArtifactId={stage.manifestArtifactId}
              setArtifactAccount={this.onManifestArtifactAccountSelected}
              setArtifactId={this.onManifestArtifactSelected}
              stage={stage}
              updatePipeline={this.props.updatePipeline}
            />
          </>
        )}
        <StageConfigField label="Required Artifacts to Bind" helpKey="kubernetes.manifest.requiredArtifactsToBind">
          <ManifestBindArtifactsSelectorDelegate
            bindings={this.getRequiredArtifacts()}
            onChangeBindings={this.onRequiredArtifactsChanged}
            pipeline={this.props.pipeline}
            stage={stage}
          />
        </StageConfigField>
        <h4>Output</h4>
        <StageConfigField label="Capture Output From" helpKey="kubernetes.runJob.captureSource">
          <div>
            <Select
              clearable={false}
              options={this.outputOptions}
              value={stage.consumeArtifactSource}
              onChange={this.sourceChanged}
            />
          </div>
        </StageConfigField>
        {outputSource}
      </div>
    );
  }
}
