import * as React from 'react';
import { ChangeEvent, PropTypes } from 'react';
import autoBindMethods from 'class-autobind-decorator';

import { FormComponent, IFormComponentProps, IFormComponentState } from '../FormComponent';
import { IFormFieldLayoutProps } from 'core/presentation';

export interface IProps extends IFormComponentProps, React.HTMLAttributes<HTMLTextAreaElement> {
  /** A react class that will layout the label, input, help, and validation error components */
  layout: React.ComponentClass<IFormFieldLayoutProps>;
  /** The label text for the textarea */
  label?: string;
  /** (optional) The help or usage rollover markup */
  _help?: React.ReactElement<any>;
  /** The class string to place on the textarea */
  className?: string;
  /** A callback for when the textarea value changes */
  onChange?(event: ChangeEvent<HTMLTextAreaElement>): void;
}

export interface IState extends IFormComponentState { }

/**
 * A Formsy form component that accepts a LayoutComponent
 */
@autoBindMethods()
export class TextArea extends FormComponent<string, IProps, IState> {
  public static contextTypes = {
    formsy: PropTypes.any
  };

  public static defaultProps = {
    name: null as any,
    onChange: () => null as any,
    className: '',
  };

  public changeValue(event: ChangeEvent<HTMLTextAreaElement>): void {
    this.setValue(event.target.value);
    this.props.onChange(event);
  }

  public render() {
    const { label, _help, layout, name, className, rows } = this.props;

    const _label = label && <label htmlFor={name}>{label}</label>;

    const isInvalid = this.showError() || this.showRequired();
    const isDirty = !this.isPristine();
    const inputClass = `form-control ${className} ${isInvalid ? 'ng-invalid' : ''} ${isDirty ? 'ng-dirty' : ''}`;
    const _input = <textarea className={inputClass} rows={rows} name={name} onChange={this.changeValue} value={this.getValue()} />;

    const errorMessage = this.getErrorMessage();
    const _error = errorMessage && isDirty && <span className="error-message">{errorMessage}</span>;

    const FormFieldLayout = layout;
    return (
      <FormFieldLayout
        showRequired={this.showRequired()}
        showError={this.showError()}
        _label={_label}
        _input={_input}
        _help={_help}
        _error={_error}
      />
    );
  }
}

