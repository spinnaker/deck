import * as React from 'react';
import { IBuildDiffInfo, ICreationMetadataTag, IExecution, IExecutionStage } from 'core/domain';
import { LabeledValue, showModal, useData } from 'core/presentation';
import { ReactInjector } from 'core/reactShims';
import { ChangesModal } from './ChangesModal';
import { ICommit } from './CommitHistory';
import { IJarDiff } from './JarDiffs';

export interface IViewChangesConfig {
  buildInfo?: IBuildDiffInfo;
  commits?: ICommit[];
  jarDiffs?: IJarDiff;
  metadata?: ICreationMetadataTag;
}

export interface IViewChangesLinkProps {
  changeConfig: IViewChangesConfig;
  linkText?: string;
  nameItem: { name: string };
  viewType?: string;
}

export const ViewChangesLink = ({ changeConfig, linkText, nameItem, viewType }: IViewChangesLinkProps) => {
  const changeConfigValue = changeConfig.metadata.value;
  const isExecution = changeConfigValue.executionType === 'pipeline';

  const fetchExecution = () => {
    if (isExecution) {
      return ReactInjector.executionService.getExecution(changeConfigValue.executionId);
    }
    /** A noop promise so `useData` can be utilized */
    return (new Promise(() => {}) as unknown) as PromiseLike<IExecution>;
  };

  const { result: executionDetails, status } = useData(fetchExecution, {} as IExecution, [
    changeConfigValue.executionId,
    changeConfigValue.stageId,
  ]);

  const stage = (executionDetails.stages || []).find((s: IExecutionStage) => s.id === changeConfigValue.stageId);
  const commits = stage?.context?.commits || changeConfig.commits || [];
  const jarDiffs = stage ? stage.context.jarDiffs : changeConfig.jarDiffs;
  const buildInfo = stage
    ? {
        ...changeConfig.buildInfo,
        ...stage.context.buildInfo,
      }
    : changeConfig.buildInfo;

  const isLoading = status !== 'RESOLVED';
  const hasJarDiffs = Object.keys(jarDiffs || {}).some((key: string) => jarDiffs[key].length > 0);
  const hasChanges = hasJarDiffs || commits.length;

  const showChangesModal = () => {
    const modalProps = {
      buildInfo,
      commits,
      jarDiffs,
      nameItem,
    };
    showModal(ChangesModal, modalProps, { maxWidth: 700 });
  };
  const viewChanges = (
    <a className="clickable" onClick={showChangesModal}>
      {linkText || 'View Changes'}
    </a>
  );

  if (isLoading || !hasChanges) {
    return null;
  }

  if (viewType === 'linkOnly') {
    return <span>{viewChanges}</span>;
  }

  return <LabeledValue label="Changes" value={viewChanges} />;
};
