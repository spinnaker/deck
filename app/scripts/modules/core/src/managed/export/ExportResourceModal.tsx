import React from 'react';

import AceEditor, { AceEditorProps } from 'react-ace';
import { safeLoad } from 'js-yaml';
import { $log } from 'ngimport';

import { Modal, ModalHeader, ModalBody, ModalFooter } from 'core/presentation/modal';
import { useLatestPromise } from 'core/presentation';
import { Spinner } from 'core/widgets';
import { CopyToClipboard } from 'core/utils';
import { SETTINGS } from 'core/config/settings';
import { AccountTag } from 'core/account';

import { ManagedReader } from '../ManagedReader';

export interface IExportResourceModalProps {
  cloudProvider: string;
  account: string;
  type: string;
  name: string;
  isManaged: boolean;
  serviceAccount: string;
  onRequestClose: () => void;
}

const PrimaryActions = ({ text, name, url }: { text: string; name: string; url: string }) => {
  return (
    <>
      <a className="button passive sp-margin-l-right" href={`${SETTINGS.gateUrl}/${url}`}>
        <i className="fas fa-file-download" /> Download {name}.yml
      </a>
      <CopyToClipboard
        className="primary"
        buttonInnerNode={
          <div>
            <i className="fas fa-copy" /> Copy to Clipboard
          </div>
        }
        text={text}
      />
    </>
  );
};

const RequestIsPending = () => <Spinner size="medium" message="Generating resource definition..." />;

const RequestWasRejected = () => (
  <div className="alert alert-danger">
    <div className="text-center">
      <h2>🥺</h2>
      <div>There was a problem generating the resource definition. Try again later.</div>
    </div>
  </div>
);

// Open question whether this info is worth displaying - or should even be included in the export
// @ts-ignore
const Metadata = ({ content }: { content: string }) => {
  if (!content) {
    return null;
  }
  try {
    const parsed = safeLoad(content);
    if (!parsed?.spec?.locations) {
      return null;
    }
    return (
      <>
        <p>
          <b>Account:</b> <AccountTag account={parsed.spec.locations.account} />
        </p>
        <p>
          <b>Regions:</b> {parsed.spec.locations.regions.map((r: any) => r.name).join(', ')}
        </p>
      </>
    );
  } catch (e) {
    $log.error(`Error parsing YAML from managed resource export:\n${content}`);
  }
  return null;
};

const YamlView = ({ content, showAll }: { content: string; showAll: boolean }) => {
  // All the height horror is because https://github.com/securingsincity/react-ace/issues/224
  const lineHeight = 14;
  let heightProps: Partial<AceEditorProps> = { height: `${lineHeight * 12}px` };
  if (showAll) {
    const lines = content.split('\n').length + 1;
    heightProps = {
      minLines: lines,
      maxLines: lines,
    };
  }
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
      .ace_gutter-cell, .ace_line { height: 14px; min-height: 14px; line-height: 14px; max-height: 14px; }
      `,
        }}
      />
      <AceEditor
        {...heightProps}
        mode="yaml"
        theme="textmate"
        width="auto"
        name="yaml-editor"
        readOnly={true}
        showGutter={true}
        cursorStart={0}
        showPrintMargin={false}
        value={content}
        setOptions={{
          firstLineNumber: 1,
          tabSize: 2,
          showLineNumbers: true,
          showFoldWidgets: false,
          highlightGutterLine: false,
          highlightActiveLine: false,
          wrapBehavioursEnabled: true,
        }}
        editorProps={{ $blockScrolling: Infinity }}
        className="ace-editor"
      />
    </>
  );
};

export const ExportResourceModal = (props: IExportResourceModalProps) => {
  const fetchResource = useLatestPromise<string>(() => ManagedReader.getResourceExport(props), []);
  const [showAll, setShowAll] = React.useState(false);
  const content = fetchResource.result;
  const totalLines = content?.split('\n').length ?? 0;
  return (
    <Modal onRequestClose={props.onRequestClose} isOpen={true}>
      <ModalHeader>Export Resource: {props.name}</ModalHeader>
      <ModalBody>
        <div className="sp-margin-l-yaxis">
          {fetchResource.status === 'PENDING' && <RequestIsPending />}
          {fetchResource.status === 'REJECTED' && <RequestWasRejected />}
          {fetchResource.status === 'RESOLVED' && (
            <>
              <h3>Psst! Managed Delivery is in pre-alpha!</h3>
              <p>
                This resource definition can be added in the environment of a delivery config. More information is
                available in the{' '}
                <a target="_blank" href="https://www.spinnaker.io/reference/managed-delivery/getting-started/">
                  getting started guide
                </a>
                .
              </p>
              {/*<Metadata content={content} />*/}
              <div style={{ border: '1px solid var(--color-silver)' }}>
                <YamlView content={content} showAll={showAll} />
              </div>
              {!showAll && (
                <button onClick={() => setShowAll(true)} className="passive sp-margin-s-top">
                  <i className="fa fa-plus" /> Show all {totalLines} lines
                </button>
              )}
            </>
          )}
        </div>
      </ModalBody>
      {fetchResource.status === 'RESOLVED' && (
        <ModalFooter
          primaryActions={
            <PrimaryActions
              text={fetchResource.result}
              url={ManagedReader.getResourceExportUrl(props)}
              name={props.name}
            />
          }
        />
      )}
    </Modal>
  );
};
