import * as React from 'react';
import { FormikProps } from 'formik';
import { Option } from 'react-select';

import { INotification, INotificationTypeConfig } from 'core/domain';
import { Registry } from 'core/registry';
import { ChecklistInput, FormikFormField, TextAreaInput } from 'core/presentation';
import { NotificationSelector } from 'core/notification';
import { NotificationTransformer } from '../notification.transformer';
import { MANUAL_JUDGEMENT_WHEN_OPTIONS, PIPELINE_WHEN_OPTIONS, STAGE_WHEN_OPTIONS } from './whenOptions';

import './editNotification.less';

export interface INotificationDetailsProps {
  formik: FormikProps<INotification>;
  level?: string;
  stageType?: string;
}

export interface INotificationDetailsState {
  notificationTypes: Option[];
  whenOptions: string[];
}

export class NotificationDetails extends React.Component<INotificationDetailsProps, INotificationDetailsState> {
  constructor(props: INotificationDetailsProps) {
    super(props);

    let whenOptions = [];
    if (props.level === 'application' || props.level === 'pipeline') {
      whenOptions = PIPELINE_WHEN_OPTIONS;
    } else if (props.stageType === 'manualJudgment') {
      whenOptions = MANUAL_JUDGEMENT_WHEN_OPTIONS;
    } else {
      whenOptions = STAGE_WHEN_OPTIONS;
    }

    this.state = {
      notificationTypes: Registry.pipeline.getNotificationTypes().map((type: INotificationTypeConfig) => ({
        label: type.label,
        value: type.key,
      })),
      whenOptions,
    };
  }

  public componentDidMount() {
    const { formik } = this.props;
    if (!formik.values.type) {
      const { notificationTypes } = this.state;
      formik.setFieldValue('type', notificationTypes ? notificationTypes[0].value : '');
    }
  }

  private renderCustomMessage = (type: string, whenOption: string): React.ReactNode => {
    if (whenOption !== 'manualJudgment' && ['email', 'slack', 'googlechat'].includes(type)) {
      return (
        <FormikFormField
          name={'message.' + whenOption + '.text'}
          input={props => <TextAreaInput {...props} placeholder="enter a custom notification message (optional)" />}
        />
      );
    } else {
      return <></>;
    }
  };

  private onNotificationTypeChange = (type: string) => {
    const notificationTypeUpdate = Registry.pipeline.getNotificationConfig(type);
    if (!!notificationTypeUpdate) {
      this.props.formik.setFieldValue('address', '');
    }
  };

  public validate(_values: INotification) {
    const { when } = this.props.formik.values;
    const errors = {} as any;
    if (!when || when.length === 0) {
      errors.whenOption = 'Please select when the notification should execute';
    }

    return errors;
  }

  public render() {
    const { onNotificationTypeChange, renderCustomMessage } = this;
    const { formik, level, stageType } = this.props;
    const { values } = formik;
    const { whenOptions } = this.state;
    return (
      <>
        <NotificationSelector onNotificationTypeChange={onNotificationTypeChange} type={values.type} />
        {(stageType || level) && (
          <div className="form-group row">
            <FormikFormField
              name="when"
              label="Notify when"
              fastField={false}
              input={props => (
                <ChecklistInput
                  {...props}
                  options={whenOptions.map(o => ({
                    value: o,
                    label: NotificationTransformer.getNotificationWhenDisplayName(o, level, stageType),
                    additionalFields: renderCustomMessage(values.type, o),
                  }))}
                />
              )}
              required={true}
            />
          </div>
        )}
      </>
    );
  }
}
