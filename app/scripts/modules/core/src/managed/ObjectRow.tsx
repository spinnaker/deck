import React from 'react';

import { Icon, IconNames } from '@spinnaker/presentation';

import './ObjectRow.less';

interface IObjectRowProps {
  content?: JSX.Element;
  icon: IconNames;
  title: JSX.Element | string;
  metadata?: React.ReactNode;
  depth?: number;
}

export const ObjectRow = ({ content, icon, title, metadata, depth = 0 }: IObjectRowProps) => {
  return (
    <div className="ObjectRow" style={{ marginLeft: 16 * depth }}>
      <span className="object-row-content">
        <div className="object-row-column object-row-title-column">
          <Icon name={icon} size="medium" appearance="dark" className="sp-margin-s-right" />
          <span className="object-row-title">{title}</span>
        </div>
        <div className="object-row-column flex-grow">
          {content}
          {metadata && <div className="flex-pull-right flex-container-h middle">{metadata}</div>}
        </div>
      </span>
    </div>
  );
};
