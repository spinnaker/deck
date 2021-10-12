import classnames from 'classnames';
import { isEmpty } from 'lodash';
import React from 'react';

import { RelativeTimestamp } from '../../RelativeTimestamp';
import { VersionOperationIcon } from './VersionOperation';
import { constraintsManager } from '../../constraints/registry';
import type { FetchVersionQueryVariables } from '../../graphql/graphql-sdk';
import {
  FetchVersionDocument,
  useRestartConstraintEvaluationMutation,
  useUpdateConstraintMutation,
} from '../../graphql/graphql-sdk';
import { CollapsibleSection, useApplicationContextSafe } from '../../../presentation';
import type { ArtifactVersionProps, QueryConstraint } from '../types';
import { getConstraintsStatusSummary } from './utils';
import { useLogEvent } from '../../utils/logging';
import { useNotifyOnError } from '../../utils/useNotifyOnError.hook';
import { Spinner } from '../../../widgets';

import './Constraints.less';

interface IConstraintContentProps {
  constraint: QueryConstraint;
  versionProps: ArtifactVersionProps;
}

const ConstraintContent = ({ constraint, versionProps }: IConstraintContentProps) => {
  const description = constraintsManager.renderDescription(constraint);
  const actions = constraintsManager.getActions(constraint)?.sort((action) => (action.pass ? -1 : 1)); // positive actions first
  const application = useApplicationContextSafe();
  const logEvent = useLogEvent('ArtifactConstraints', 'UpdateStatus');

  const refetchVariables: FetchVersionQueryVariables = { appName: application.name, versions: [versionProps.version] };
  const refetchQueries = [{ query: FetchVersionDocument, variables: refetchVariables }];

  const showRestartButton = constraintsManager.isRestartVisible(constraint);

  const baseRequestProps = {
    application: application.name,
    environment: versionProps.environment,
    version: versionProps.version,
    reference: versionProps.reference,
    type: constraint.type,
  };

  const [
    updateConstraint,
    { loading: isUpdatingConstraint, error: updateConstraintError },
  ] = useUpdateConstraintMutation({ refetchQueries });

  const [
    restartConstraint,
    { loading: isRestartingConstraint, error: restartConstraintError },
  ] = useRestartConstraintEvaluationMutation({
    variables: { payload: baseRequestProps },
    refetchQueries,
  });

  useNotifyOnError({
    key: 'updateConstraintError',
    content: `Failed to update constraint`,
    error: updateConstraintError,
  });

  useNotifyOnError({
    key: 'restartConstraintError',
    content: `Failed to restart constraint`,
    error: restartConstraintError,
  });

  return (
    <dl className="constraint-content">
      {description && <dd>{description}</dd>}
      {(!isEmpty(actions) || showRestartButton) && (
        <dd className={classnames(description ? 'sp-margin-s-top' : undefined, 'horizontal middle')}>
          {actions?.map(({ title, pass }) => (
            <button
              className={classnames('btn md-btn constraint-action-button', pass ? 'md-btn-success' : 'md-btn-danger')}
              key={title}
              disabled={isUpdatingConstraint}
              onClick={() => {
                logEvent({ data: { newStatus: pass } });
                updateConstraint({
                  variables: { payload: { ...baseRequestProps, status: pass ? 'FORCE_PASS' : 'FAIL' } },
                });
              }}
            >
              {title}
            </button>
          ))}
          {showRestartButton && (
            <button
              className="btn md-btn constraint-action-button md-btn-accent"
              disabled={isUpdatingConstraint}
              onClick={() => {
                restartConstraint();
              }}
            >
              {constraintsManager.getRestartDisplayName(constraint)}
            </button>
          )}
          {isUpdatingConstraint ||
            (isRestartingConstraint && <Spinner mode="circular" size="nano" color="var(--color-accent)" />)}
        </dd>
      )}
    </dl>
  );
};

interface IConstraintProps {
  constraint: QueryConstraint;
  versionProps: ArtifactVersionProps;
}

const Constraint = ({ constraint, versionProps }: IConstraintProps) => {
  const hasContent = constraintsManager.hasContent(constraint);
  const title = constraintsManager.renderTitle(constraint);
  return (
    <div className="version-constraint single-constraint">
      <VersionOperationIcon status={constraint.status} size="small" className="constraint-icon" />
      <CollapsibleSection
        outerDivClassName=""
        defaultExpanded
        toggleClassName="constraint-toggle"
        enableCaching={false}
        expandIconSize="12px"
        expandIconPosition="right"
        heading={({ chevron }) => (
          <div className="constraint-title">
            <div>
              {title}
              {constraint.judgedAt && (
                <span className="sp-margin-xs-left">
                  (<RelativeTimestamp timestamp={constraint.judgedAt} withSuffix />)
                </span>
              )}
            </div>
            {chevron}
          </div>
        )}
      >
        {hasContent || constraintsManager.isRestartVisible(constraint) ? (
          <ConstraintContent constraint={constraint} versionProps={versionProps} />
        ) : undefined}
      </CollapsibleSection>
    </div>
  );
};

export const Constraints = ({
  constraints,
  versionProps,
  expandedByDefault,
}: {
  constraints?: QueryConstraint[];
  versionProps: ArtifactVersionProps;
  expandedByDefault?: boolean;
}) => {
  if (!constraints || !constraints.length) return null;
  const summary = getConstraintsStatusSummary(constraints);
  return (
    <div className="Constraints">
      <div className="version-constraint">
        <VersionOperationIcon status={summary.status} className="constraints-icon" />
        <CollapsibleSection
          heading={({ chevron }) => (
            <div className="horizontal">
              Constraints: {summary.text} {chevron}
            </div>
          )}
          outerDivClassName=""
          toggleClassName="constraint-toggle"
          bodyClassName="sp-margin-xs-top sp-margin-xs-bottom"
          expandIconSize="12px"
          expandIconPosition="right"
          defaultExpanded={expandedByDefault}
          enableCaching={false}
        >
          {constraints?.map((constraint, index) => (
            <Constraint key={index} constraint={constraint} versionProps={versionProps} />
          ))}
        </CollapsibleSection>
      </div>
    </div>
  );
};
