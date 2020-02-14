import React from 'react';
import { get } from 'lodash';

import {
  FormikFormField,
  IArtifact,
  IExpectedArtifact,
  IFormInputProps,
  IFormikStageConfigInjectedProps,
  IgorService,
  IPipeline,
  MapEditorInput,
  ReactSelectInput,
  StageArtifactSelector,
  TextInput,
  useData,
  YamlEditor,
} from 'core';
import { CheckboxInput } from 'core/presentation';
import { EXCLUDED_ARTIFACT_TYPES, SOURCE_TYPES, IAwsCodeBuildSource } from './IAwsCodeBuildSource';
import { AwsCodeBuildSourceList } from './AwsCodeBuildSourceList';

interface IAwsCodeBuildStageFormProps {
  updatePipeline: (pipeline: IPipeline) => void;
}

export function AwsCodeBuildStageForm(props: IAwsCodeBuildStageFormProps & IFormikStageConfigInjectedProps) {
  const stage = props.formik.values;

  const { result: fetchAccountsResult, status: fetchAccountsStatus } = useData(
    () => IgorService.getCodeBuildAccounts(),
    [],
    [],
  );

  const onYamlChange = (buildspec: string, _: any): void => {
    props.formik.setFieldValue('source.buildspec', buildspec);
  };

  const setArtifactId = (artifactId: string): void => {
    props.formik.setFieldValue('source.sourceArtifact.artifactId', artifactId);
    props.formik.setFieldValue('source.sourceArtifact.artifact', null);
  };

  const setArtifact = (artifact: IArtifact): void => {
    props.formik.setFieldValue('source.sourceArtifact.artifact', artifact);
    props.formik.setFieldValue('source.sourceArtifact.artifactId', null);
  };

  const updateSources = (sources: IAwsCodeBuildSource[]): void => {
    props.formik.setFieldValue('secondarySources', sources);
  };

  return (
    <div className="form-horizontal">
      <h4>Basic Settings</h4>
      <FormikFormField
        fastField={false}
        label="Account"
        name="account"
        input={(inputProps: IFormInputProps) => (
          <ReactSelectInput
            {...inputProps}
            clearable={false}
            isLoading={fetchAccountsStatus === 'PENDING'}
            stringOptions={fetchAccountsResult}
          />
        )}
      />
      {/* TODO: Select project from a drop-down list. Behind the scene, gate calls igor to fetch projects list */}
      <FormikFormField
        fastField={false}
        label="Project Name"
        name="projectName"
        input={(inputProps: IFormInputProps) => <TextInput {...inputProps} />}
      />
      <h4>Source Configuration</h4>
      <FormikFormField
        fastField={false}
        label="Source"
        name="source.sourceOverride"
        input={(inputProps: IFormInputProps) => (
          <CheckboxInput {...inputProps} text="Override source to Spinnaker artifact" />
        )}
      />
      {stage.source.sourceOverride === true && (
        <FormikFormField
          fastField={false}
          label="SourceType"
          name="source.sourceType"
          input={(inputProps: IFormInputProps) => (
            <ReactSelectInput {...inputProps} clearable={true} stringOptions={SOURCE_TYPES} />
          )}
        />
      )}
      {stage.source.sourceOverride === true && (
        <FormikFormField
          fastField={false}
          label="Source Artifact Override"
          name="source"
          input={(inputProps: IFormInputProps) => (
            <StageArtifactSelector
              {...inputProps}
              artifact={get(stage, 'source.sourceArtifact.artifact')}
              excludedArtifactTypePatterns={EXCLUDED_ARTIFACT_TYPES}
              expectedArtifactId={get(stage, 'source.sourceArtifact.artifactId')}
              onArtifactEdited={setArtifact}
              onExpectedArtifactSelected={(artifact: IExpectedArtifact) => setArtifactId(artifact.id)}
              pipeline={props.pipeline}
              stage={stage}
            />
          )}
        />
      )}
      <FormikFormField
        fastField={false}
        label="Source Version"
        name="source.sourceVersion"
        input={(inputProps: IFormInputProps) => <TextInput {...inputProps} />}
      />
      <FormikFormField
        fastField={false}
        label="Buildspec"
        name="source.buildspec"
        input={(inputProps: IFormInputProps) => (
          <YamlEditor {...inputProps} value={get(stage, 'source.buildspec')} onChange={onYamlChange} />
        )}
      />
      <FormikFormField
        fastField={false}
        label="Secondary Sources"
        name="secondarySources"
        input={(inputProps: IFormInputProps) => (
          <AwsCodeBuildSourceList
            {...inputProps}
            sources={get(stage, 'secondarySources')}
            updateSources={updateSources}
            stage={stage}
            pipeline={props.pipeline}
          />
        )}
      />
      <h4>Environment Configuration</h4>
      <FormikFormField
        fastField={false}
        label="Image"
        name="image"
        input={(inputProps: IFormInputProps) => <TextInput {...inputProps} />}
      />
      <h4>Advanced Configuration</h4>
      <FormikFormField
        fastField={false}
        label="Environment Variables"
        name="environmentVariables"
        input={(inputProps: IFormInputProps) => (
          <MapEditorInput {...inputProps} addButtonLabel="Add environment variable" />
        )}
      />
    </div>
  );
}
