import classNames from 'classnames';
import React from 'react';
import { Subject } from 'rxjs';

import { ArtifactIcon } from 'core/artifact';
import { IPipeline, IStage } from 'core/domain';

import { EditAwsCodeBuildSourceModal } from './EditAwsCodeBuildSourceModal';
import { EditAwsCodeBuildSecondarySourceVersionModal } from './EditAwsCodeBuildSecondarySourceVersionModal';
import { IAwsCodeBuildSource, IAwsCodeBuildSecondarySourcesVersion } from './IAwsCodeBuildSource';
import { IPipeline, IStage } from 'core/domain';
import { ArtifactIcon } from 'core/artifact';

export interface IAwsCodeBuildSourceListProps {
  stage: IStage;
  pipeline: IPipeline;
  sources: IAwsCodeBuildSource[];
  updateSources: (notifications: IAwsCodeBuildSource[]) => void;
}

export interface IAwsCodeBuildSecondarySourceVersionListProps extends IFormInputProps {
  stage: IStage;
  pipeline: IPipeline;
}

export class AwsCodeBuildSecondarySourcesVersionList extends React.Component<IAwsCodeBuildSecondarySourceVersionListProps> {
  private destroy$ = new Subject();

  constructor(props: IAwsCodeBuildSecondarySourceVersionListProps) {
    super(props);
  }

  public componentWillUnmount() {
    this.destroy$.next();
  }

  private addSecondarySourcesVersion = () => {
    this.editSecondarySourceVersion();
  };

  private editSecondarySourceVersion = (source?: IAwsCodeBuildSecondarySourcesVersion, index?: number) => {
    const { secondarySourcesVersionOverride, updateSecondarySourcesVersion, stage, pipeline } = this.props;
    EditAwsCodeBuildSecondarySourceVersionModal.show({
      secondarySourcesVersionOverride: source || {},
      stage,
      pipeline,
    })
      .then((newSecondarySource) => {
        const secondarySourceCopy = secondarySourcesVersionOverride || [];
        if (!source) {
          updateSecondarySourcesVersion(secondarySourceCopy.concat(newSecondarySource));
        } else {
          const updateSeconary = [...secondarySourceCopy];
          updateSeconary[index] = newSecondarySource;
          updateSecondarySourcesVersion(updateSeconary);
        }
      })
      .catch(() => { });
  };

  private removeSource = (index: number) => {
    const secondarySourcesVersionOverride = [...this.props.secondarySourcesVersionOverride];
    secondarySourcesVersionOverride.splice(index, 1);
    this.props.updateSecondarySourcesVersion(secondarySourcesVersionOverride);
  };

  public render() {
    const { secondarySourcesVersionOverride } = this.props;
    return (
      <div className="row">
        <div className={'col-md-12'}>
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Source Identifier</th>
                <th>Source Version</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {secondarySourcesVersionOverride &&
                secondarySourcesVersionOverride.map((secondarySourceVersion, i) => {
                  return (
                    <tr key={i} className={classNames({ 'templated-pipeline-item': false })}>
                      <td>{secondarySourceVersion.sourceIdentifier}</td>
                      <td>{secondarySourceVersion.sourceVersion}</td>
                      <td>
                        <button className="btn btn-xs btn-link" onClick={() => this.editSecondarySourceVersion(secondarySourceVersion, i)}>
                          Edit
                        </button>
                        <button className="btn btn-xs btn-link" onClick={() => this.removeSource(i)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7}>
                  <button className="btn btn-block add-new" onClick={() => this.addSecondarySourcesVersion()}>
                    <span className="glyphicon glyphicon-plus-sign" /> Add Secondary Sources Version Override
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }
}

export class AwsCodeBuildSourceList extends React.Component<IAwsCodeBuildSourceListProps> {
  private destroy$ = new Subject();

  constructor(props: IAwsCodeBuildSourceListProps) {
    super(props);
  }

  public componentWillUnmount() {
    this.destroy$.next();
  }

  private addSource = () => {
    this.editSource();
  };

  private editSource = (source?: IAwsCodeBuildSource, index?: number) => {
    const { sources, updateSources, stage, pipeline } = this.props;
    EditAwsCodeBuildSourceModal.show({
      source: source || {},
      stage,
      pipeline,
    })
      .then((newSource) => {
        const sourceCopy = sources || [];
        if (!source) {
          updateSources(sourceCopy.concat(newSource));
        } else {
          const update = [...sourceCopy];
          update[index] = newSource;
          updateSources(update);
        }
      })
      .catch(() => { });
  };

  private removeSource = (index: number) => {
    const sources = [...this.props.sources];
    sources.splice(index, 1);
    this.props.updateSources(sources);
  };

  public render() {
    const { sources } = this.props;
    return (
      <div className="row">
        <div className={'col-md-12'}>
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Artifact</th>
                <th>Type</th>
                <th>Source Version</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources &&
                sources.map((source, i) => {
                  return (
                    <tr key={i} className={classNames({ 'templated-pipeline-item': false })}>
                      <td>
                        <ArtifactIcon type={source.sourceArtifact.artifactType} width="16" height="16" />
                        {source.sourceArtifact.artifactDisplayName}
                      </td>
                      <td>{source.type}</td>
                      <td>{source.sourceVersion}</td>
                      <td>
                        <button className="btn btn-xs btn-link" onClick={() => this.editSource(source, i)}>
                          Edit
                        </button>
                        <button className="btn btn-xs btn-link" onClick={() => this.removeSource(i)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7}>
                  <button className="btn btn-block add-new" onClick={() => this.addSource()}>
                    <span className="glyphicon glyphicon-plus-sign" /> Add Secondary Source
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }
}
