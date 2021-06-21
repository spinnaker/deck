import classnames from 'classnames';
import React from 'react';
import './MessageBox.less';

interface IMessageBoxProps {
  type?: 'warning' | 'error';
}

const typeToClassName: { [key in Required<IMessageBoxProps>['type']]: string } = {
  error: 'fas fa-times',
  warning: 'fas fa-exclamation',
};

export const MessageBox: React.FC<IMessageBoxProps> = ({ children, type }) => {
  return (
    <div className={classnames('MessageBox sp-padding-m', type?.toLowerCase())}>
      {type && (
        <div>
          <i className={classnames(typeToClassName[type], 'message-icon')} />
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

interface IMessagesSectionProps {
  sticky?: boolean;
}

export const MessagesSection: React.FC<IMessagesSectionProps> = ({ children, sticky }) => {
  return <div className={classnames('MessagesSection', { sticky })}>{children}</div>;
};
