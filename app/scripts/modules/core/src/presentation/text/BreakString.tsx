import * as React from 'react';
import * as classNames from 'classnames';

import * as styles from './BreakString.module.css';

export interface IBreakStringProps {
  className?: string;
  children?: React.ReactNode;
}

export const BreakString = ({ className, children }: IBreakStringProps) => (
  <span className={classNames(styles.breakString, className)}>{children}</span>
);
