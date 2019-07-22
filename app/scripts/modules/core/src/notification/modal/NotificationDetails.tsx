import * as React from 'react';
import { FormikProps } from 'formik';
import { Option } from 'react-select';

import { INotification, INotificationTypeConfig } from 'core/domain';
import { Registry } from 'core/registry';
import { buildValidators, ChecklistInput, FormikFormField, TextAreaInput } from 'core/presentation';
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
      formik.setFieldValue('type', notificationTypes && notificationTypes[0] ? notificationTypes[0].value : '');
    }
  }

  private renderCustomMessage = (type: string, whenOption: string, selectedOptions: string[]): React.ReactNode => {
    if (
      whenOption !== 'manualJudgment' &&
      ['email', 'slack', 'googlechat'].includes(type) &&
      selectedOptions.includes(whenOption)
    ) {
      return (
        <FormikFormField
          name={'message.' + whenOption + '.text'}
          input={props => <TextAreaInput {...props} placeholder="enter a custom notification message (optional)" />}
        />
      );
    } else {
      return null;
    }
  };

  private onNotificationTypeChange = (type: string) => {
    const notificationTypeUpdate = Registry.pipeline.getNotificationConfig(type);
    if (!!notificationTypeUpdate) {
      this.props.formik.setFieldValue('address', '');
    }
    this.props.formik.setFieldValue('when', [...this.props.formik.values.when]);
  };

  public validate(values: INotification) {
    const validation = buildValidators(values);
    validation
      .field('when', 'Notify when')
      .required([(value: any[]) => !value.length && 'Please select when the notification should execute']);
    return validation.result();
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
              input={props => (
                <ChecklistInput
                  {...props}
                  options={whenOptions.map(o => ({
                    value: o,
                    label: NotificationTransformer.getNotificationWhenDisplayName(o, level, stageType),
                    additionalFields: renderCustomMessage(values.type, o, formik.values.when),
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
