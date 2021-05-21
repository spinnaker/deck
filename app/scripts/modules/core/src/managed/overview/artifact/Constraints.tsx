import classnames from 'classnames';
import { isEmpty } from 'lodash';
import React from 'react';

import { Icon } from '@spinnaker/presentation';
import { CollapsibleSection, useApplicationContextSafe } from 'core/presentation';
import { NotifierService } from 'core/widgets';

import { RelativeTimestamp } from '../../RelativeTimestamp';
import { VersionOperationIcon } from './VersionOperation';
import { constraintsManager } from '../../constraints/registry';
import { FetchApplicationDocument, useUpdateConstraintMutation } from '../../graphql/graphql-sdk';
import spinner from '../loadingIndicator.svg';
import { ArtifactVersionProps, QueryConstraint } from '../types';
import { getConstraintsStatusSummary } from './utils';

import './Constraints.less';

interface IConstraintContentProps {
  constraint: QueryConstraint;
  versionProps: ArtifactVersionProps;
}

const ConstraintContent = ({ constraint, versionProps }: IConstraintContentProps) => {
  const description = constraintsManager.renderDescription(constraint);
  const actions = constraintsManager.getActions(constraint)?.sort((action) => (action.pass ? -1 : 1)); // positive actions first
  const application = useApplicationContextSafe();

  const [updateConstraint, { loading, error }] = useUpdateConstraintMutation({
    refetchQueries: [{ query: FetchApplicationDocument, variables: { appName: application?.name } }],
  });

  React.useEffect(() => {
    if (error) {
      NotifierService.publish({
        action: 'create',
        key: 'updateConstraintError',
        content: `Failed to update constraint - ${error.message}`,
        options: { type: 'error' },
      });
    }
  }, [error]);

  return (
    <dl className="constraint-content">
      {description && <dd>{description}</dd>}
      {!isEmpty(actions) && (
        <dd>
          {actions?.map(({ title, pass }) => (
            <button
              className={classnames('btn md-btn constraint-action-button', pass ? 'md-btn-success' : 'md-btn-danger')}
              key={title}
              disabled={loading}
              onClick={() => {
                updateConstraint({
                  variables: {
                    payload: {
                      application: application.name,
                      environment: versionProps.environment,
                      version: versionProps.version,
                      type: constraint.type,
                      reference: versionProps.reference,
                      status: pass ? 'FORCE_PASS' : 'FAIL',
                    },
                  },
                });
              }}
            >
              {title}
            </button>
          ))}
          {loading && <img src={spinner} height={14} />}
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
    <div className="pending-version-constraint">
      <VersionOperationIcon status={constraint.status} />
      <CollapsibleSection
        outerDivClassName=""
        defaultExpanded
        toggleClassName="constraint-toggle"
        enableCaching={false}
        expandIconSize="12px"
        heading={({ chevron }) => (
          <div className="constraint-title">
            {title}{' '}
            {constraint.judgedAt && (
              <span className="sp-margin-xs-left">
                (<RelativeTimestamp timestamp={constraint.judgedAt} withSuffix />)
              </span>
            )}
            {chevron}
          </div>
        )}
      >
        {hasContent ? <ConstraintContent constraint={constraint} versionProps={versionProps} /> : undefined}
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
  const [showSummary, setShowSummary] = React.useState(Boolean(expandedByDefault));
  if (!constraints || !constraints.length) return null;
  const summary = getConstraintsStatusSummary(constraints);
  return (
    <div className="Constraints">
      {showSummary ? (
        constraints?.map((constraint, index) => (
          <Constraint key={index} constraint={constraint} versionProps={versionProps} />
        ))
      ) : (
        <div className="pending-version-constraint">
          <VersionOperationIcon status={summary.status} />
          <span className="constraint-title">
            Constraints: {summary.text} (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowSummary(true);
              }}
            >
              expand
            </a>
            )
          </span>
        </div>
      )}
    </div>
  );
};
