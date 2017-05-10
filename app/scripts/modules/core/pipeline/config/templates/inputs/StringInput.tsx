import {module} from 'angular';
import * as React from 'react';
import {
  IVariableInputBuilder, VariableInputService, IVariable, IVariableProps, IVariableState
} from './variableInput.service';
import autoBindMethods from 'class-autobind-decorator';
import {VariableError} from '../VariableError';

@autoBindMethods
class StringInput extends React.Component<IVariableProps, IVariableState> {

  public render() {
    return (
      <div>
        <input
          type="text"
          className="form-control input-sm"
          value={this.props.variable.value || ''}
          onChange={this.extractValue}
          required={true}
        />
        {!this.props.variable.hideErrors && <VariableError errors={this.props.variable.errors}/>}
      </div>
    );
  }

  private extractValue(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.onChange({value: e.target.value, type: this.props.variable.type, name: this.props.variable.name});
  }
}

export class StringInputBuilder implements IVariableInputBuilder {

  public handles(type: string): boolean {
    return type === 'string';
  }

  public getInput(variable: IVariable, onChange: (variable: IVariable) => void) {
    return <StringInput variable={variable} onChange={onChange}/>;
  }
}

export const STRING_INPUT = 'spinnaker.core.pipelineTemplate.stringInput';
module(STRING_INPUT, [])
  .run((variableInputService: VariableInputService) => variableInputService.addInput(new StringInputBuilder()));
