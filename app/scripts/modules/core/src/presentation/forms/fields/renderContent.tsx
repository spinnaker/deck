import * as React from 'react';

/**
 * A helper for rendering "render prop" contents
 *
 * Supports:
 *
 * - React Class
 * - Functional component
 * - JSX.Element or string
 */
export function renderContent<T>(Content: string | JSX.Element | React.ComponentType<T>, props: T): React.ReactNode {
  if (typeof Content === 'function') {
    const Component = Content as React.ComponentType<T>;
    return <Component {...props} />;
  } else {
    return Content;
  }
}
