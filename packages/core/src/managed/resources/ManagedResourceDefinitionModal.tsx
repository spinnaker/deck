import React from 'react';
import AceEditor from 'react-ace';

import { QueryResource } from '../overview/types';
import { IModalComponentProps, ModalBody, ModalHeader, showModal } from '../../presentation/modal';

import './ManagedResourceDefinitionModal.less';

export type IManagedResourceDefinitionModalProps = IModalComponentProps & { resource: QueryResource };

export const showManagedResourceDefinitionModal = (props: IManagedResourceDefinitionModalProps) =>
  showModal(ManagedResourceDefinitionModal, props);

export const ManagedResourceDefinitionModal = ({ resource }: IManagedResourceDefinitionModalProps) => {
  return (
    <>
      <ModalHeader>
        Resource definition - {resource.displayName}
        <div className="ManagedResourceDefinitionSubtitle">
          (Includes resolved fields and metadata added by the system)
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="ManagedResourceDefinitionModal">
          <div className="sp-margin-xl-bottom">
            <AceEditor
              mode="yaml"
              theme="textmate"
              readOnly
              fontSize={12}
              cursorStart={0}
              showPrintMargin={false}
              highlightActiveLine={true}
              maxLines={Infinity}
              value={resource.rawDefinition}
              setOptions={{
                firstLineNumber: 1,
                tabSize: 2,
                showLineNumbers: true,
                showFoldWidgets: true,
              }}
              style={{ width: 'auto' }}
              className="ace-editor sp-margin-s-top"
              editorProps={{ $blockScrolling: true }}
              onLoad={(editor) => {
                // This removes the built-in search box (as it doesn't scroll properly to matches)
                // commands is missing in the type def and therefore we have to cast as any
                (editor as any).commands?.removeCommand('find');
              }}
            />
          </div>
        </div>
      </ModalBody>
    </>
  );
};
