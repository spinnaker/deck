import { isEmpty } from 'lodash';
import React from 'react';
import { Button } from 'react-bootstrap';

import { Icon } from '@spinnaker/presentation';
import { useApplicationContextSafe } from 'core/presentation';
import { NotifierService } from 'core/widgets';

import { constraintsManager } from '../../constraints/registry';
import { FetchApplicationDocument, useUpdateConstraintMutation } from '../../graphql/graphql-sdk';
import { ArtifactVersionProps, QueryConstraint } from '../types';

const constraintStatusUtils: {
  [key in QueryConstraint['status']]: { color?: string; icon: string; displayName: string };
} = {
  FAIL: { color: 'var(--color-status-error)', icon: 'far fa-times', displayName: 'failed' },
  FORCE_PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check', displayName: 'overridden' },
  PASS: { color: 'var(--color-status-success)', icon: 'fas fa-check', displayName: 'passed' },
  PENDING: { icon: 'far fa-hourglass', displayName: 'pending' },
};

const ConstraintIcon = ({ status }: { status: QueryConstraint['status'] }) => {
  return (
    <i
      className={constraintStatusUtils[status].icon}
      style={{ color: constraintStatusUtils[status].color || 'var(--color-titanium)' }}
    />
  );
};

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
            <Button
              className="constraint-action-button"
              key={title}
              bsStyle={pass ? 'success' : 'danger'}
              bsSize="small"
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
            </Button>
          ))}
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
      <ConstraintIcon status={constraint.status} />
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
            <Icon name="accordionExpand" size="12px" style={{ transform: isExpanded ? 'rotate(-90deg)' : undefined }} />
          </a>
        ) : (
          title
        )}
        {isExpanded && <ConstraintContent constraint={constraint} versionProps={versionProps} />}
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
    <div className="pending-version-constraints">
      {constraints?.map((constraint, index) => (
        <Constraint key={index} constraint={constraint} versionProps={versionProps} />
      ))}
    </div>
  );
};
