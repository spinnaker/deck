import * as React from 'react';

import { IExpectedArtifact, IStage, IPipeline } from 'core/domain';
import { ExpectedArtifactModal, ArtifactTypePatterns } from 'core/artifact';
import { module } from 'angular';
import { react2angular } from 'react2angular';

export interface IProducesArtifactsProps {
  pipeline: IPipeline;
  stage: IStage;
  onProducesChanged: (artifacts: IExpectedArtifact[], stage: IStage) => void;
}

export const ProducesArtifacts: React.SFC<IProducesArtifactsProps> = props => {
  const excludedArtifactTypePatterns = [ArtifactTypePatterns.FRONT50_PIPELINE_TEMPLATE];
  const { pipeline, stage, onProducesChanged } = props;
  const produces: IExpectedArtifact[] = stage.expectedArtifacts || [];

  const removeExpectedArtifact = (artifact: IExpectedArtifact) => {
    const producesAfterRemove = produces.slice(0);
    producesAfterRemove.splice(produces.findIndex(a => artifact.id === a.id), 1);
    onProducesChanged(producesAfterRemove, stage);
  };

  const editExpectedArtifact = (artifact: IExpectedArtifact) => {
    ExpectedArtifactModal.show({
      expectedArtifact: artifact,
      pipeline: pipeline,
      excludedArtifactTypePatterns: excludedArtifactTypePatterns,
    }).then((editedArtifact: IExpectedArtifact) => {
      const editIndex = produces.findIndex(a => a.id === editedArtifact.id);
      const producesAfterEdit = produces.slice(0);
      producesAfterEdit[editIndex] = editedArtifact;
      onProducesChanged(producesAfterEdit, stage);
    });
  };

  const defineNewExpectedArtifact = () => {
    ExpectedArtifactModal.show({
      pipeline: pipeline,
      excludedArtifactTypePatterns: excludedArtifactTypePatterns,
    }).then((artifact: IExpectedArtifact) => {
      const producesAfterNew = produces.slice(0);
      producesAfterNew.push(artifact);
      onProducesChanged(producesAfterNew, stage);
    });
  };

  return (
    <>
      <table className="table table-condensed">
        <thead>
          <tr>
            <th>Display name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produces.map(artifact => (
            <tr key={artifact.id}>
              <td>{artifact.displayName}</td>
              <td>
                <a className="glyphicon glyphicon-edit" onClick={() => editExpectedArtifact(artifact)} />
                <a className="glyphicon glyphicon-trash" onClick={() => removeExpectedArtifact(artifact)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-block btm-sm add-new" onClick={defineNewExpectedArtifact}>
        <span className="glyphicon glyphicon-plus-sign" /> <span className="visible-xl-inline">Define artifact</span>
      </button>
    </>
  );
};

export const PRODUCES_ARTIFACTS_REACT = 'spinnaker.core.pipeline.stages.produces.artifacts.react';
module(PRODUCES_ARTIFACTS_REACT, []).component(
  'producesArtifactsReact',
  react2angular(ProducesArtifacts, ['pipeline', 'stage', 'onProducesChanged']),
);
