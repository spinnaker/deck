import classnames from 'classnames';
import React from 'react';

import { IIconProps } from '@spinnaker/presentation';
import { IconTooltip } from 'core/presentation';

import { TOOLTIP_DELAY } from '../utils/defaults';

interface IBaseEnvironmentItemProps {
  title: string | React.ReactElement;
  className?: string;
  iconTooltip: string;
  iconName: IIconProps['name'];
  size?: 'regular' | 'small';
}

export const BaseEnvironmentItem: React.FC<IBaseEnvironmentItemProps> = ({
  title,
  size = 'regular',
  iconName,
  iconTooltip,
  className,
  children,
}) => {
  return (
    <div className={classnames(className, 'environment-row-element')}>
      <div className="row-icon">
        <IconTooltip
          tooltip={iconTooltip}
          name={iconName}
          color="primary-g1"
          size={size === 'regular' ? '20px' : '18px'}
          delayShow={TOOLTIP_DELAY}
        />
      </div>
      <div className="row-details">
        <div className={classnames('row-title', size)}>{title}</div>
        {children}
      </div>
    </div>
  );
};
