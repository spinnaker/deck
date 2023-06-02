import React, { memo } from 'react';

import { iconsByName } from './iconsByName';

export type IconNames = keyof typeof iconsByName;

export type IIconProps = {
  name?: IconNames;
  reactComponent?: ReactComponent;
  appearance?: 'light' | 'neutral' | 'dark';
  size?: 'extraSmall' | 'small' | 'medium' | 'large' | 'extraLarge' | string;
  color?: string;
  className?: string;
};

const DEFAULT_SIZE = 'small';
const DEFAULT_APPEARANCE = 'neutral';

const pxDimensionsBySize: { [size: string]: string } = {
  extraSmall: '16px',
  small: '20px',
  medium: '24px',
  large: '32px',
  extraLarge: '40px',
};

const throwInvalidIconError = (name: string) => {
  throw new Error(`No icon with the name ${name} exists`);
};

export const Icon = memo(({ name, reactComponent, appearance, size, color, className }: IIconProps) => {
  let Component;
  if (reactComponent) {
    Component = reactComponent;
  } else {
    Component = iconsByName[name];
    if (!Component) {
      throwInvalidIconError(name);
    }
  }

  const width = size ? pxDimensionsBySize[size] || size : pxDimensionsBySize[DEFAULT_SIZE];
  const fill = color ? `var(--color-${color})` : `var(--color-icon-${appearance || DEFAULT_APPEARANCE})`;

  return <Component className={className} style={{ width, fill }} />;
});
