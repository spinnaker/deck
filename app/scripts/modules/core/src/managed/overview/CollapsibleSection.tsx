import cx from 'classnames';
import React from 'react';

import { Icon } from '@spinnaker/presentation';

import './CollapsibleSection.less';

interface Props {
  expandedByDefault?: boolean;
  title: React.ReactNode;
}

export const CollapsibleSection: React.FC<Props> = ({ expandedByDefault, title, children }) => {
  const [isExpanded, setIsExpanded] = React.useState(expandedByDefault);
  return (
    <div className="CollapsibleSection">
      <div className="section-header" onClick={() => setIsExpanded((state) => !state)}>
        <div>{title}</div>
        <Icon
          name="accordionCollapse"
          size="16px"
          className={cx(['section-header-chevron', { rotated: !isExpanded }])}
          color="concrete"
        />
      </div>
      <div>{isExpanded && children}</div>
    </div>
  );
};
