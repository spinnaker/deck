import React from 'react';

import { Icon, IIconProps } from '@spinnaker/presentation';

import { ITooltipProps, Tooltip } from './Tooltip';

export interface IconTooltipProps extends IIconProps {
  tooltip: string;
  placement?: ITooltipProps['placement'];
  wrapperClassName?: string;
}

export const IconTooltip = ({ tooltip, placement, wrapperClassName, ...iconProps }: IconTooltipProps) => {
  return (
    <Tooltip value={tooltip} placement={placement}>
      <div className={wrapperClassName}>
        <Icon {...iconProps} />
      </div>
    </Tooltip>
  );
};
