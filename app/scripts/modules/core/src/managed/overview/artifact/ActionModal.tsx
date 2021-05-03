import React from 'react';

import { Button } from '../../Button';
import { MarkAsBadIntro } from '../../artifactDetail/MarkArtifactAsBadModal';
import { PinVersionIntro } from '../../artifactDetail/PinArtifactModal';
import { UnpinVersionIntro } from '../../artifactDetail/UnpinArtifactModal';
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

export interface IArtifactActionModalProps extends IModalComponentProps {
  title: string;
  actionName: string;
  withComment?: boolean;
  onAction: (comment?: string) => Promise<void> | PromiseLike<void>;
  onSuccess?: () => void;
}

const ArtifactActionModal: React.FC<IArtifactActionModalProps> = ({
  title,
  dismissModal,
  closeModal,
  onAction,
  onSuccess,
  actionName,
  withComment = true,
  children,
}) => {
  const LOG_CATEGORY = `Environments::Artifact::${actionName}`;
  return (
    <>
      <ModalHeader className="truncate">{title}</ModalHeader>
      <SpinFormik<{ comment?: string }>
        initialValues={{}}
        onSubmit={async ({ comment }, { setSubmitting, setStatus }) => {
          if (withComment && !comment) return;
          try {
            await onAction(comment);
            onSuccess?.();
            logEvent({
              category: LOG_CATEGORY,
              action: actionName,
            });
            closeModal?.();
          } catch (error) {
            setStatus({ error: error.data });
            logEvent({
              category: LOG_CATEGORY,
              action: `${actionName} - Failed`,
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
                  {children}
                  {withComment && (
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
                  )}
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
                      {actionName}
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

export const PinActionModal = ({ application, ...props }: IArtifactActionModalProps & { application: string }) => {
  return (
    <ArtifactActionModal {...props}>
      <PinVersionIntro application={application} />
    </ArtifactActionModal>
  );
};

export const UnpinActionModal = ({
  application,
  environment,
  ...props
}: IArtifactActionModalProps & { application: string; environment: string }) => {
  return (
    <ArtifactActionModal {...props}>
      <UnpinVersionIntro application={application} environment={environment} />
    </ArtifactActionModal>
  );
};

export const MarkAsBadActionModal = ({
  application,
  ...props
}: IArtifactActionModalProps & { application: string }) => {
  return (
    <ArtifactActionModal {...props}>
      <MarkAsBadIntro application={application} />
    </ArtifactActionModal>
  );
};
