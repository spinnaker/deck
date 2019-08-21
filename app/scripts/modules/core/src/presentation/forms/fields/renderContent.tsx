import * as React from 'react';
import { isFunction } from 'lodash';

/**
 * A helper for rendering "render prop" contents
 *
 * Supports:
 * - Render Function
 * - ReactNode (JSX.Element or string)
 */
export function renderContent<T>(Content: React.ReactNode | React.FunctionComponent<T>, props: T): React.ReactNode {
  if (isFunction(Content)) {
    const renderFunction = Content;
    return renderFunction(props);
  }

  return Content;
}
