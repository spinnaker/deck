import * as React from 'react';
import autoBindMethods from 'class-autobind-decorator';

import { ReactInjector } from 'core/reactShims';

import { IVariableMetadata } from './pipelineTemplate.service';
import { IVariable, IVariableInputBuilder } from './inputs/variableInput.service';
import { VariableMetadataHelpField } from './VariableMetadataHelpField';

import './Variable.less';

export interface IVariableProps {
  variableMetadata: IVariableMetadata;
  variable: IVariable;
  onChange: (variable: IVariable) => void;
}

@autoBindMethods
export class Variable extends React.Component<IVariableProps> {

  private getVariableInput(): JSX.Element {
    const input: IVariableInputBuilder = ReactInjector.variableInputService.getInputForType(this.props.variableMetadata.type);
    return input ? input.getInput(this.props.variable, this.props.onChange) : null;
  }

  public render() {
    return (
      <div>
        <div className="form-group clearfix pipeline-template-variable">
          <div className="col-md-4">
            <div className="pull-right">
              <code>{this.props.variable.name}</code>
              <VariableMetadataHelpField metadata={this.props.variableMetadata}/>
            </div>
          </div>
          <div className="col-md-7">
            {this.getVariableInput()}
          </div>
        </div>
      </div>
    );
  }
}
