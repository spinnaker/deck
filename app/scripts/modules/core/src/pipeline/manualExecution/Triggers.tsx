import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import Select, { Option } from 'react-select';
import { clone, head, set } from 'lodash';
import { FormikProps } from 'formik';

import { IPipelineCommand, ITrigger } from 'core/domain';
import { StandardFieldLayout } from 'core/presentation';
import { Registry } from 'core/registry';

import { ITriggerTemplateComponentProps, TriggerTemplate } from './TriggerTemplate';

export interface ITriggersProps {
  triggerChanged: (t: ITrigger) => void;
  triggerComponent?: React.ComponentType<ITriggerTemplateComponentProps>;
  triggers: ITrigger[];
  formik: FormikProps<IPipelineCommand>;
}

export interface ITriggersState {
  command: IPipelineCommand;
}

export class Triggers extends React.Component<ITriggersProps, ITriggersState> {
  private destroy$ = new Subject();

  constructor(props: ITriggersProps) {
    super(props);
    this.state = {
      command: props.formik.values,
    };
  }

  public componentDidMount() {
    this.updateTriggerDescription(this.props.formik.values.trigger);
  }

  public componentWillUnmount() {
    this.destroy$.next();
  }

  private updateCommand = (path: string, value: any) => {
    const { formik } = this.props;
    formik.setFieldValue(path, value);
    const newCommand = { ...this.state.command };
    set(newCommand, path, value);
    this.setState({ command: newCommand });
  };

  private updateTriggerDescription = (trigger: ITrigger) => {
    if (trigger && !trigger.description) {
      Observable.fromPromise(
        (Registry.pipeline.getManualExecutionComponentForTriggerType(trigger.type) as any).formatLabel(trigger),
      )
        .takeUntil(this.destroy$)
        .subscribe((label: string) => {
          const newTrigger = clone(trigger);
          newTrigger.description = label;
          this.props.formik.setFieldValue('trigger', newTrigger);
          this.props.triggerChanged(trigger);
          this.setState({ command: { ...this.state.command, trigger } });
        });
    } else {
      this.props.triggerChanged(trigger);
    }
  };

  private triggerSelected = (option: Option<string>) => {
    const triggerDescription = option.value;
    const { formik, triggers, triggerChanged } = this.props;
    const trigger = triggers.find(t => t.description === triggerDescription);
    formik.setFieldValue('trigger', trigger);
    formik.setFieldValue('triggerInvalid', false);
    triggerChanged(trigger);
    this.setState({ command: { ...this.state.command, trigger } });
  };

  public render() {
    const { formik, triggerComponent, triggers } = this.props;
    const { command } = this.state;
    return (
      <div className="form-group row">
        {triggers.length === 1 && <p className="form-control-static">{head(triggers).description}</p>}
        {triggers.length > 1 && (
          <StandardFieldLayout
            label={'Trigger'}
            input={
              <Select
                className={'trigger-select'}
                clearable={false}
                options={triggers.map(t => ({
                  label: t.description,
                  value: t.description,
                }))}
                value={formik.values.trigger ? formik.values.trigger.description : ''}
                onChange={this.triggerSelected}
              />
            }
          />
        )}

        {triggerComponent && (
          <div className={'trigger-template'}>
            <TriggerTemplate updateCommand={this.updateCommand} component={triggerComponent} command={command} />
          </div>
        )}
      </div>
    );
  }
}
