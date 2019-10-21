import * as React from 'react';
import { cloneDeep, filter, get, head, isEmpty } from 'lodash';
import { Modal } from 'react-bootstrap';
import { Form, Formik, FormikProps } from 'formik';

import { AccountService } from 'core/account/AccountService';
import { ApplicationWriter } from 'core/application/service/ApplicationWriter';
import { Application, IApplicationAttributes } from 'core/application';
import { HelpField } from 'core/help';
import { ModalClose, SubmitButton } from 'core/modal';
import { FormikPagerDutySelectField } from 'core/pagerDuty';
import { TaskReader } from 'core/task/task.read.service';
import { SETTINGS } from 'core/config/settings';

import {
  CheckboxInput,
  FormikFormField,
  IModalComponentProps,
  NumberInput,
  ReactSelectInput,
  SpinFormik,
  TextAreaInput,
  TextInput,
  useLatestPromise,
  Validators,
} from 'core/presentation';
import { IPermissions, PermissionsConfigurer } from './PermissionsConfigurer';
import { ApplicationProviderFields } from './ApplicationProviderFields';

export interface IEditApplicationModalProps extends IModalComponentProps {
  application: Application;
}

interface IEditError {
  variables: IEditErrorVariables[];
}

interface IEditErrorVariables {
  [k: string]: any;
}

export function EditApplicationModal(props: IEditApplicationModalProps) {
  const [showOverrideWarning, setShowOverrideWarning] = React.useState<string>(null);
  const [permissionsInvalid, setPermissionsInvalid] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errorMsgs, setErrorMsgs] = React.useState<string[]>([]);
  const formikRef = React.createRef<Formik<IApplicationAttributes>>();
  const { application, closeModal, dismissModal } = props;
  const initialValues = cloneDeep(application.attributes);
  const gitSources = SETTINGS.gitSources || ['stash', 'github', 'bitbucket', 'gitlab'];
  const fetchCloudProviders = useLatestPromise(() => AccountService.listProviders(), []);
  const cloudProviders = fetchCloudProviders.result || [];

  const extractErrorMsg = (error: IEditError) => {
    const errors = get(head(filter(error.variables, { key: 'exception' })), 'value.details.errors', []);
    setErrorMsgs(errors);
    setSubmitting(false);
  };

  const updateCloudProviderHealthWarning = (
    platformHealthOnlyShowOverride: boolean,
    platformHealthOnly: boolean,
    platformHealthOnlyShowOverrideClicked: boolean,
  ): void => {
    if (platformHealthOnlyShowOverride && (platformHealthOnlyShowOverrideClicked || platformHealthOnly)) {
      // Show the warning if platformHealthOnlyShowOverride is being disabled, or if both options are enabled and
      // platformHealthOnly is being disabled.
      setShowOverrideWarning(`Note that disabling this setting will not have an effect on any
          pipeline stages with the "Consider only 'platform' health?" option explicitly enabled. You will
          need to update each of those pipeline stages individually if desired.`);
    } else if (!platformHealthOnlyShowOverride && platformHealthOnlyShowOverrideClicked) {
      // Show the warning if platformHealthOnlyShowOverride is being enabled.
      setShowOverrideWarning(`Simply enabling the "Consider only cloud provider health when executing tasks"
          option above is usually sufficient for most applications that want the same health provider behavior for
          all stages. Note that pipelines will require manual updating if this setting is disabled in the future.`);
    }
  };

  const updateApplication = (applicationFieldPath: string, value: any): void => {
    const formik = formikRef.current && (formikRef.current.getFormikBag() as FormikProps<IApplicationAttributes>);
    formik.setFieldValue(applicationFieldPath, value);
  };

  const handlePermissionsChange = (permissions: IPermissions) => {
    setPermissionsInvalid(!permissionsAreValid(permissions));
    updateApplication('permissions', permissions);
    updateApplication('requiredGroupMembership', null);
  };

  const permissionsAreValid = (permissions: IPermissions) => {
    if (permissions.READ.includes(null) || permissions.WRITE.includes(null)) {
      return false;
    } else if (permissions.READ.length > 0 && permissions.WRITE.length === 0) {
      return false;
    }
    return true;
  };

  const submit = (data: IApplicationAttributes): void => {
    const dataToBeSubmitted = cloneDeep(data);
    setSubmitting(true);
    if (dataToBeSubmitted.aliases === '') {
      delete dataToBeSubmitted.aliases;
    }
    if (dataToBeSubmitted.aliases) {
      dataToBeSubmitted.aliases = dataToBeSubmitted.aliases
        .split(/\s*,\s*/)
        .filter(s => s !== '')
        .join(',');
    }

    ApplicationWriter.updateApplication(dataToBeSubmitted).then(
      task => TaskReader.waitUntilTaskCompletes(task).then(() => closeModal(dataToBeSubmitted), extractErrorMsg),
      () => setErrorMsgs([...errorMsgs, 'Could not update application']),
    );
  };

  return (
    <SpinFormik<IApplicationAttributes>
      initialValues={initialValues}
      onSubmit={submit}
      ref={formikRef}
      render={formik => (
        <Form className="form-horizontal">
          <Modal key="modal" show={true} onHide={() => {}}>
            <ModalClose dismiss={dismissModal} />
            <Modal.Header>
              <h3>Edit Application</h3>
            </Modal.Header>
            <Modal.Body>
              <FormikFormField
                name="name"
                label="Name"
                input={fieldProps => <TextInput {...fieldProps} readOnly={true} />}
              />
              <FormikFormField
                name="email"
                label="Owner Email *"
                validate={Validators.emailValue('Please enter a valid email address')}
                input={fieldProps => <TextInput {...fieldProps} placeholder="Enter an email address" required={true} />}
              />
              <FormikFormField
                name="aliases"
                label="Alias(es)"
                input={fieldProps => <TextInput {...fieldProps} placeholder="List of aliases" />}
              />
              <FormikFormField
                name="repoType"
                label="Repo Type"
                input={fieldProps => <ReactSelectInput {...fieldProps} stringOptions={gitSources} />}
              />
              {!isEmpty(formik.values.repoType) && (
                <>
                  <FormikFormField
                    name="repoProjectKey"
                    label="Repo Name"
                    input={fieldProps => (
                      <TextInput {...fieldProps} placeholder="Enter your source repository project name" />
                    )}
                  />
                  <FormikFormField
                    name="repoSlug"
                    label="Repo Project"
                    validate={(value: string) =>
                      value && !value.match(/^((?!:\/\/).)*$/) && `Enter your source repository name (not the URL)`
                    }
                    input={fieldProps => (
                      <TextInput {...fieldProps} placeholder="Enter your source repository name (not the url)" />
                    )}
                  />
                </>
              )}
              {get(SETTINGS, `feature.pagerDuty`, false) && <FormikPagerDutySelectField />}
              <FormikFormField
                name="description"
                label="Description"
                input={fieldProps => <TextAreaInput {...fieldProps} placeholder="Enter a descriptio" />}
              />
              <FormikFormField
                name="cloudProviders"
                label="Cloud Provider"
                fastField={false}
                input={fieldProps => <ReactSelectInput {...fieldProps} stringOptions={cloudProviders} multi={true} />}
              />
              <ApplicationProviderFields
                application={props.application}
                cloudProviders={formik.values.cloudProviders}
                updateApplication={updateApplication}
              />
              <FormikFormField
                name="platformHealthOnly"
                label="Instance Health"
                onChange={() =>
                  updateCloudProviderHealthWarning(
                    formik.values.platformHealthOnlyShowOverride,
                    formik.values.platformHealthOnly,
                    false,
                  )
                }
                input={fieldProps => (
                  <CheckboxInput
                    {...fieldProps}
                    text={
                      <>
                        Consider only cloud provider health when executing tasks{' '}
                        <HelpField id={'application.platformHealthOnly'} />
                      </>
                    }
                  />
                )}
              />
              <FormikFormField
                name="platformHealthOnlyShowOverride"
                label=" "
                onChange={() =>
                  updateCloudProviderHealthWarning(
                    formik.values.platformHealthOnlyShowOverride,
                    formik.values.platformHealthOnly,
                    true,
                  )
                }
                input={fieldProps => (
                  <CheckboxInput
                    {...fieldProps}
                    text={
                      <>
                        Show health override option for each operation{' '}
                        <HelpField id={'application.showPlatformHealthOverride'} />
                      </>
                    }
                  />
                )}
              />
              {!isEmpty(showOverrideWarning) && (
                <div>
                  <div className="alert alert-warning">
                    <p>
                      <i className="fa fa-exclamation-triangle" /> {showOverrideWarning}
                    </p>
                    <p className="text-right">
                      <a
                        className="btn btn-sm btn-default dirty-flag-dismiss clickable"
                        onClick={() => setShowOverrideWarning(null)}
                      >
                        Okay
                      </a>
                    </p>
                  </div>
                </div>
              )}
              <FormikFormField
                name="instancePort"
                label="Instance Port"
                help={<HelpField id="application.instance.port" />}
                input={fieldProps => <NumberInput {...fieldProps} min={0} max={65536} />}
              />
              <FormikFormField
                name="enableRestartRunningExecutions"
                label="Pipeline Behavior"
                input={fieldProps => (
                  <CheckboxInput
                    {...fieldProps}
                    text={
                      <>
                        Enable restarting running pipelines{' '}
                        <HelpField id={'application.enableRestartRunningExecutions'} />
                      </>
                    }
                  />
                )}
              />
              <FormikFormField
                name="enableRerunActiveExecutions"
                label=" "
                input={fieldProps => (
                  <CheckboxInput
                    {...fieldProps}
                    text={
                      <>
                        Enable re-run button on active pipelines{' '}
                        <HelpField id={'application.enableRerunActiveExecutions'} />
                      </>
                    }
                  />
                )}
              />
              {get(SETTINGS, `feature.fiatEnabled`, false) && (
                <div className="StandardFieldLayout flex-container-h baseline margin-between-lg">
                  <div className="StandardFieldLayout_Label sm-label-right">
                    Permissions <HelpField id="application.permissions" />
                  </div>
                  <div className="flex-grow">
                    <PermissionsConfigurer
                      permissions={formik.values.permissions}
                      onPermissionsChange={handlePermissionsChange}
                      requiredGroupMembership={formik.values.requiredGroupMembership}
                    />
                  </div>
                </div>
              )}
              {!isEmpty(errorMsgs) && (
                <div className="form-group row slide-in">
                  {errorMsgs.map((e, index) => (
                    <div key={index} className="col-sm-9 col-sm-offset-3 error-message">
                      {e}
                    </div>
                  ))}
                </div>
              )}
              <div className="form-group row">
                <div className="col-md-12">
                  <em>* Required</em>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button className="btn btn-default" onClick={dismissModal} type="button">
                Cancel
              </button>
              <SubmitButton
                isDisabled={!formik.isValid || permissionsInvalid}
                submitting={submitting}
                isFormSubmit={true}
                label="Update"
                onClick={() => submit(formik.values)}
              />
            </Modal.Footer>
          </Modal>
        </Form>
      )}
    />
  );
}
