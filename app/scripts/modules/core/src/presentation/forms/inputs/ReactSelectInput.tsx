import * as React from 'react';
import Select, { Option, OptionValues, ReactSelectProps } from 'react-select';
import VirtualizedSelect from 'react-virtualized-select';
import { isNil } from 'lodash';

import { noop } from 'core/utils';

import { StringsAsOptions } from './StringsAsOptions';
import { TetheredSelect } from '../../TetheredSelect';
import { createFakeReactSyntheticEvent, isStringArray, orEmptyString } from './utils';
import { IFormInputProps, OmitControlledInputPropsFrom } from '../interface';

export interface IReactSelectInputProps<T = OptionValues>
  extends IFormInputProps,
    OmitControlledInputPropsFrom<ReactSelectProps<T>> {
  stringOptions?: string[];
  mode?: 'TETHERED' | 'VIRTUALIZED' | 'PLAIN';
}

// TODO: use standard css classes (from style guide?)
// Currently the form-control class is needed for ng-invalid, but messes up the rendering of react-select
export const reactSelectValidationErrorStyle = {
  borderColor: 'var(--color-danger)',
  WebkitBoxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
  boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
};

/**
 * Given a IControlledInputProps "field" (i.e., from Formik), returns an onChange handler
 * somewhat compatible with the controlled input pattern
 */
export const reactSelectOnChangeAdapter = (name: string, onChange: IReactSelectInputProps['onChange']) => {
  return (selection: Option | Option[]) => {
    const value = !selection ? null : Array.isArray(selection) ? selection.map(x => x.value) : selection.value;
    const target = { name, value };
    const event = createFakeReactSyntheticEvent(target);
    return (onChange || noop)(event);
  };
};

/**
 * Given a IControlledInputProps "field" (i.e., from Formik), returns an onBlur handler
 * somewhat compatible with the controlled input pattern
 */
export const reactSelectOnBlurAdapter = (name: string, value: any, onBlur: IReactSelectInputProps['onBlur']) => {
  return () => {
    const target = { name, value };
    const event = createFakeReactSyntheticEvent(target);
    return (onBlur || noop)(event);
  };
};

/**
 * A react-select Input
 *
 * This input supports error validation state rendering. It adapts the onChange event to a controlled input event.
 *
 * This component does not attempt to support async loading
 */
export class ReactSelectInput extends React.Component<IReactSelectInputProps> {
  public static defaultProps: Partial<IReactSelectInputProps> = {
    mode: 'TETHERED',
  };

  public render() {
    const {
      name,
      onChange,
      onBlur,
      value,
      mode,
      validation,
      stringOptions,
      options: optionOptions,
      ignoreAccents: accents,
      inputClassName,
      ...otherProps
    } = this.props;

    // Default to false because this feature is SLOW
    const ignoreAccents = isNil(accents) ? false : accents;
    const className = orEmptyString(inputClassName);
    const style = (validation || {}).validationStatus === 'error' ? reactSelectValidationErrorStyle : {};
    const fieldProps = {
      name,
      value: orEmptyString(value),
      onBlur: reactSelectOnBlurAdapter(name, value, onBlur),
      onChange: reactSelectOnChangeAdapter(name, onChange),
    };

    const commonProps = { className, style, ignoreAccents, ...fieldProps, ...otherProps };

    const SelectElement = ({ options }: { options: IReactSelectInputProps['options'] }) =>
      mode === 'TETHERED' ? (
        <TetheredSelect {...commonProps} options={options} />
      ) : mode === 'VIRTUALIZED' ? (
        <VirtualizedSelect {...commonProps} options={options} optionRenderer={null} />
      ) : (
        <Select {...commonProps} options={options} />
      );

    if (isStringArray(stringOptions)) {
      return (
        <StringsAsOptions strings={stringOptions}>{options => <SelectElement options={options} />}</StringsAsOptions>
      );
    } else {
      return <SelectElement options={optionOptions} />;
    }
  }
}
