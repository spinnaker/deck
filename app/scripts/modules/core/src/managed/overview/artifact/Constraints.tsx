import cx from 'classnames';
import { isEmpty } from 'lodash';
import React from 'react';

import { Icon } from '@spinnaker/presentation';
import { useApplicationContextSafe } from 'core/presentation';
import { NotifierService } from 'core/widgets';

import { VersionOperationIcon } from './VersionOperation';
import { constraintsManager } from '../../constraints/registry';
import { FetchApplicationDocument, useUpdateConstraintMutation } from '../../graphql/graphql-sdk';
import spinner from '../loadingIndicator.svg';
import { ArtifactVersionProps, QueryConstraint } from '../types';

import './Constraints.less';

const ConstraintContent = ({
  constraint,
  versionProps,
}: {
  constraint: QueryConstraint;
  versionProps: ArtifactVersionProps;
}) => {
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
              className={cx('btn md-btn constraint-action-button', pass ? 'md-btn-success' : 'md-btn-danger')}
              key={title}
              disabled={loading}
              onClick={() => {
                updateConstraint({
                  variables: {
                    application: application.name,
                    environment: versionProps.environment,
                    status: {
                      artifactVersion: versionProps.version,
                      type: constraint.type,
                      artifactReference: versionProps.reference,
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

const Constraint = ({
  constraint,
  versionProps,
}: {
  constraint: QueryConstraint;
  versionProps: ArtifactVersionProps;
}) => {
  const hasContent = constraintsManager.hasContent(constraint);
  const [isExpanded, setIsExpanded] = React.useState(hasContent && constraint.status !== 'PASS');
  const title = constraintsManager.renderTitle(constraint);
  return (
    <div className="pending-version-constraint">
      <VersionOperationIcon status={constraint.status} />
      <div>
        {hasContent ? (
          <a
            href="#"
            className="constraint-title"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded((state) => !state);
            }}
          >
            {title}
            <Icon name="accordionExpand" size="12px" className={isExpanded ? 'rotated-90' : undefined} />
          </a>
        ) : (
          <span className="constraint-title">{title}</span>
        )}
        {isExpanded && hasContent && <ConstraintContent constraint={constraint} versionProps={versionProps} />}
      </div>
    </div>
  );
};

export const Constraints = ({
  constraints,
  versionProps,
}: {
  constraints: QueryConstraint[];
  versionProps: ArtifactVersionProps;
}) => {
  return (
    <div className="Constraints">
      {constraints?.map((constraint, index) => (
        <Constraint key={index} constraint={constraint} versionProps={versionProps} />
      ))}
    </div>
  );
};
