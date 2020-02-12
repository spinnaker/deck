import * as React from 'react';
import { throttle } from 'lodash';

import { useEventListener } from './useEventListener.hook';
import { useLatestCallback } from './useLatestCallback.hook';

const { useState, useCallback } = React;

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
///                  WARNING: EXPERIMENTAL                    ///
/// The details of this implementation (and its API contract) ///
///          may change in the foreseeable future             ///
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

const BREAKPOINT_MOBILE = 1024;

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= BREAKPOINT_MOBILE);

  const resizeListener = useLatestCallback(() => setIsMobile(window.innerWidth <= BREAKPOINT_MOBILE));
  const memoizedResizeListener = useCallback(throttle(resizeListener, 200), []);

  useEventListener(window, 'resize', memoizedResizeListener);

  return isMobile;
};
