import { debounce } from 'lodash';
import React from 'react';

export const useWindowDimensions = ({ delay = 200, isActive = true }: { delay?: number; isActive?: boolean }) => {
  const [dimension, setDimension] = React.useState({ width: window.innerWidth, height: window.innerHeight });

  React.useLayoutEffect(() => {
    const debouncedResizeHandler = debounce(() => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    }, delay);
    if (isActive) {
      window.addEventListener('resize', debouncedResizeHandler);
      return () => window.removeEventListener('resize', debouncedResizeHandler);
    } else {
      return () => {};
    }
  }, [delay, isActive]);

  React.useLayoutEffect(() => {
    if (isActive) {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    }
  }, [isActive]);

  return dimension;
};

const getElementDimensions = (ref: React.RefObject<HTMLElement>) =>
  ref.current ? { width: ref.current.offsetWidth, height: ref.current.offsetHeight } : { width: 0, height: 0 };

export const useElementDimensions = ({
  ref,
  delay = 200,
  isActive = true,
}: {
  ref: React.RefObject<HTMLElement>;
  delay?: number;
  isActive?: boolean;
}) => {
  const [dimension, setDimension] = React.useState(getElementDimensions(ref));

  React.useLayoutEffect(() => {
    const debouncedResizeHandler = debounce(() => {
      setDimension(getElementDimensions(ref));
    }, delay);

    if (isActive && ref.current) {
      const observer = new ResizeObserver(debouncedResizeHandler);
      observer.observe(ref.current);
      return () => observer.disconnect();
    } else {
      return () => {};
    }
  }, [delay, isActive, ref.current]);

  return dimension;
};
