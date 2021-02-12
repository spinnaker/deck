import React from 'react';

import { Application } from '.';

export const ApplicationContext = React.createContext<Application | null>(null);

export const ApplicationContextProvider: React.FC<{ app: Application }> = ({ app, children }) => {
  return <ApplicationContext.Provider value={app}>{children}</ApplicationContext.Provider>;
};
