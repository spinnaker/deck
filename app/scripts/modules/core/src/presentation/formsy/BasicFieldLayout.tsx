import * as React from 'react';
import { IFormFieldLayoutProps } from './formFieldLayout';

/**
 * A Form Field Layout component for Formsy Form Field components
 *
 * Accepts four react elements as props (_label, _input, _help, _error) and lays them out using bootstrap grid.
 *
 * +----------------div.form-group----------------------------+
 * |                 +-------------div.col-md-9--------------+|
 * |<label.col-md-3> |+-------------------------------------+||
 * |                 ||input element                        |||
 * |                 |+-------------------------------------+||
 * |                 |                                       ||
 * |                 |<help element>                         ||
 * |                 |                                       ||
 * |                 |<validation element>                   ||
 * |                 |                                       ||
 * |                 +---------------------------------------+|
 * +----------------------------------------------------------+
 */
export class BasicFieldLayout extends React.Component<IFormFieldLayoutProps, {}> {
  constructor(props: IFormFieldLayoutProps) {
    super(props);
  }

  public render() {
    const { _label, _input, _help, _error, showRequired, showError } = this.props;

    const renderedLabel = _label && <div className="col-md-3 sm-label-right"> {_label} </div>;
    const renderedHelp = _help && <div className="small text-right"> {_help} </div>;
    const renderedError = _error && <div className="ng-invalid"> {_error} </div>;

    const renderedInputGroup = _input && (
      <div className="col-md-9">
        {_input}
        {renderedHelp}
        {renderedError}
      </div>
    );

    const className = `form-group ${showRequired || showError ? 'ng-invalid' : ''}`;
    return (
      <div className={className}>
        {renderedLabel}
        {renderedInputGroup}
      </div>
    );
  }
}
