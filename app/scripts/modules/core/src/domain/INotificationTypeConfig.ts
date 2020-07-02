import React from 'react';

export interface INotificationTypeConfig {
  label: string;
  key: string;
  config?: INotificationTypeCustomConfig;
  component?: React.ComponentType;
  isExtensionNotification?: boolean;
}

export interface INotificationTypeCustomConfig {
  fieldName?: string;
  botName?: string;
}
