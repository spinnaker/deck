import React from 'react';

import { module } from 'angular';
import { react2angular } from 'react2angular';

import { Application } from 'core/application';
import { ExportResourceModal } from './ExportResourceModal';

export interface IExportResourceMenuItemProps {
  cloudProvider: string;
  account: string;
  type: string;
  name: string;
  isManaged: boolean;
  application: Application;
}

export const ExportResourceMenuItem = (props: IExportResourceMenuItemProps) => {
  const [modalIsOpen, setModalIsOpen] = React.useState(false);

  return (
    <>
      <li className="divider" />
      <li>
        <a onClick={() => setModalIsOpen(true)}>Export Resource Definition</a>
        {modalIsOpen && (
          <ExportResourceModal
            {...props}
            onRequestClose={() => setModalIsOpen(false)}
            serviceAccount={props.application.attributes.email}
          />
        )}
      </li>
    </>
  );
};

export const EXPORT_RESOURCE_MENU_ITEM = 'spinnaker.core.managed.export.menu.item';
module(EXPORT_RESOURCE_MENU_ITEM, []).component(
  'exportResourceMenuItem',
  react2angular(ExportResourceMenuItem, ['cloudProvider', 'account', 'type', 'name', 'isManaged', 'application']),
);
