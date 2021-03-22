import React from 'react';
import { Application } from '../../application';
import { ApplicationContext } from '../../application/ApplicationContext';

export const useApplicationContext = (): Application | undefined => {
  const app = React.useContext(ApplicationContext);
  if (app === undefined) {
    console.warn('Application context provider is missing');
  }
  return app;
};
