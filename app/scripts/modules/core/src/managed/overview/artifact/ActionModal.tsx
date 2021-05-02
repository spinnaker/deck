import React from 'react';

import { Button } from '../../Button';
import { ManagedWriter } from '../../ManagedWriter';
import { PinVersionIntro } from '../../artifactDetail/PinArtifactModal';
import {
  FormikFormField,
  IModalComponentProps,
  ModalBody,
  ModalFooter,
  ModalHeader,
  SpinFormik,
  TextAreaInput,
  ValidationMessage,
} from '../../../presentation';
import { logEvent } from '../../utils/logging';

export interface IPinArtifactModalProps extends IModalComponentProps {
  application: string;
  environment: string;
  reference: string;
  version: string;
  title: string;
}

const LOG_CATEGORY = 'Environments - pin version modal';

export const ArtifactActionModal = ({
  application,
  environment,
  reference,
  version,
  title,
  dismissModal,
  closeModal,
}: IPinArtifactModalProps) => {
  return (
    <>
      <ModalHeader>{title}</ModalHeader>
      <SpinFormik<{
        comment?: string;
      }>
        initialValues={{}}
        onSubmit={async ({ comment }, { setSubmitting, setStatus }) => {
          if (!comment) return;
          try {
            await ManagedWriter.pinArtifactVersion({
              environment,
              reference,
              comment,
              application,
              version,
            });
            logEvent({
              category: LOG_CATEGORY,
              action: 'Version pinned',
              label: environment,
            });
            closeModal?.();
          } catch (error) {
            setStatus({ error: error.data });
            logEvent({
              category: LOG_CATEGORY,
              action: 'Error pinning version',
              label: environment,
            });
          } finally {
            setSubmitting(false);
          }
        }}
        render={({ status, isValid, isSubmitting, submitForm }) => {
          const errorTitle = status?.error?.error;
          const errorMessage = status?.error?.message;

          return (
            <>
              <ModalBody>
                <div className="flex-container-v middle sp-padding-xl-yaxis">
                  <PinVersionIntro application={application} />
                  <FormikFormField
                    label="Reason"
                    name="comment"
                    required={true}
                    input={(props) => (
                      <TextAreaInput
                        {...props}
                        rows={5}
                        required={true}
                        placeholder="Please provide a reason. Markdown is supported :)"
                      />
                    )}
                  />
                  {status?.error && (
                    <div className="sp-margin-xl-top">
                      <ValidationMessage
                        type="error"
                        message={
                          <span className="flex-container-v">
                            <span className="text-bold">Something went wrong:</span>
                            {errorTitle && <span className="text-semibold">{errorTitle}</span>}
                            {errorMessage && <span>{errorMessage}</span>}
                          </span>
                        }
                      />
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter
                primaryActions={
                  <div className="flex-container-h sp-group-margin-s-xaxis">
                    <Button onClick={() => dismissModal?.()}>Cancel</Button>
                    <Button appearance="primary" disabled={!isValid || isSubmitting} onClick={() => submitForm()}>
                      Pin
                    </Button>
                  </div>
                }
              />
            </>
          );
        }}
      />
    </>
  );
};
