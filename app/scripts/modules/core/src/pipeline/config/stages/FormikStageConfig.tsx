import * as React from 'react';
import { Formik, FormikProps, FormikErrors } from 'formik';

import { IStage, IPipeline } from 'core/domain';
import { Application } from 'core/application';
import { LayoutProvider, ResponsiveFieldLayout } from 'core/presentation';

export interface IEffectProps {
  formik: FormikProps<IStage>;
  onChange(values: any): void;
}

class Effect extends React.Component<IEffectProps> {
  public componentDidUpdate() {
    this.props.onChange && this.props.onChange(this.props.formik.values);
  }
  public render(): null {
    return null;
  }
}

export interface IFormikStageConfigInjectedProps {
  application: Application;
  pipeline: IPipeline;
  formik: FormikProps<IStage>;
}

export type IContextualValidator = (values: IStage, context: any) => void | object | Promise<FormikErrors<IStage>>;

export interface IFormikStageConfigProps {
  application: Application;
  stage: IStage;
  pipeline: IPipeline;
  validate?: IContextualValidator;
  render: (props: IFormikStageConfigInjectedProps) => React.ReactNode;
  onChange?: (values: IStage) => void;
}

export type IFormikValidator = (values: IStage) => void | object | Promise<FormikErrors<IStage>>;

const decorate = (validate: IContextualValidator, props: IFormikStageConfigProps): IFormikValidator => {
  const { application, pipeline } = props;
  return (values: IStage) => validate(values, { application, pipeline });
};

export class FormikStageConfig extends React.Component<IFormikStageConfigProps> {
  public render() {
    const { render, onChange, stage, validate, application, pipeline } = this.props;
    return (
      <Formik<IStage>
        validate={validate && decorate(validate, this.props)}
        initialValues={stage}
        onSubmit={() => {}}
        render={formik => (
          <LayoutProvider value={ResponsiveFieldLayout}>
            <Effect formik={formik} onChange={onChange} />
            {render({ application, pipeline, formik })}
          </LayoutProvider>
        )}
      />
    );
  }
}
