import { Application } from 'core/application';
import React from 'react';

export const ApplicationContext = React.createContext<Application | null>(null);

export const ApplicationContextProvider: React.FC<{ app: Application }> = ({ app, children }) => {
  return <ApplicationContext.Provider value={app}>{children}</ApplicationContext.Provider>;
};
