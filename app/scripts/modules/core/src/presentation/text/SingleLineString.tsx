import * as React from 'react';
import * as classNames from 'classnames';

import * as styles from './SingleLineString.module.css';

export interface ISingleLineStringProps {
  className?: string;
  children?: React.ReactNode;
}

export const SingleLineString = ({ className, children }: ISingleLineStringProps) => (
  <span className={classNames(styles.singleLineString, className)}>{children}</span>
);
