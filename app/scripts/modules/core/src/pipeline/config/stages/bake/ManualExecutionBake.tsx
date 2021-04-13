import { get } from 'lodash';
import React from 'react';

import { HelpField } from 'core/help/HelpField';
import { CheckboxInput, FormField } from 'core/presentation';

import { ITriggerTemplateComponentProps } from '../../../manualExecution/TriggerTemplate';

export class ManualExecutionBake extends React.Component<ITriggerTemplateComponentProps> {
  private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const checked = target.checked;
    this.props.updateCommand('trigger.rebake', checked);
    this.setState({});
  };

  public render() {
    const force = get(this.props.command, 'trigger.rebake', false);

    return (
      <FormField
        label="Rebake"
        onChange={this.handleChange}
        value={force}
        help={<HelpField id="execution.forceRebake" />}
        input={(props) => <CheckboxInput {...props} text="Force Rebake" />}
      />
    );
  }
}
