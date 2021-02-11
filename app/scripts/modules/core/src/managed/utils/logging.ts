import React from 'react';
import ReactGA from 'react-ga';
import { ApplicationContext } from './ApplicationContext';

interface LogProps {
  category: string;
  action: string;
  application?: string;
  label?: string;
}

export const logEvent = ({ category, action, application, label }: LogProps) => {
  ReactGA.event({
    category,
    action,
    label: (application ? `${application}:` : ``) + label,
  });
};

export const useLogEvent = (category: string) => {
  const app = React.useContext(ApplicationContext);
  return (props: Omit<LogProps, 'application' | 'category'>) => {
    logEvent({ ...props, category, application: app?.name });
  };
};
