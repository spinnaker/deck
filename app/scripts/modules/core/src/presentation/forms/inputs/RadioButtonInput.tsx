import * as React from 'react';
import { Option } from 'react-select';

import { Markdown, OmitControlledInputPropsFrom } from 'core/presentation';

import { isStringArray, orEmptyString, validationClassName } from './utils';
import { IFormInputProps } from '../interface';

interface IRadioButtonInputProps
  extends IFormInputProps,
    OmitControlledInputPropsFrom<React.TextareaHTMLAttributes<any>> {
  stringOptions?: string[];
  options?: IRadioButtonOptions[];
  inputClassName?: string;
  inline?: boolean;
}

interface IRadioButtonOptions extends Option {
  help?: React.ReactNode;
}

export const RadioButtonInput = (props: IRadioButtonInputProps) => {
  const { inline, value: selectedValue, validation, inputClassName, options, stringOptions, ...otherProps } = props;
  const radioOptions = isStringArray(stringOptions) ? stringOptions.map(value => ({ value, label: value })) : options;

  const userClassName = orEmptyString(inputClassName);
  const validClassName = validationClassName(validation);
  const elementClassName = `RadioButtonInput radio ${userClassName} ${validClassName}`;

  const RadioButton = ({ option }: { option: IRadioButtonOptions }) => (
    <label key={option.label} className={inline ? 'radio-inline clickable' : 'inline clickable'}>
      <input type="radio" {...otherProps} value={option.value as any} checked={option.value === selectedValue} />
      <Markdown message={option.label} style={option.help && { display: 'inline-block' }} />
      {option.help && <> {option.help}</>}
    </label>
  );

  const VerticalRadioButtons = ({ opts }: { opts: IRadioButtonOptions[] }) => (
    <div className={`${elementClassName} vertical left`}>
      {opts.map(option => (
        <RadioButton key={option.label} option={option} />
      ))}
    </div>
  );

  const InlineRadioButtons = ({ opts }: { opts: IRadioButtonOptions[] }) => (
    <div className={elementClassName}>
      {opts.map(option => (
        <RadioButton key={option.label} option={option} />
      ))}
    </div>
  );

  return inline ? <InlineRadioButtons opts={radioOptions} /> : <VerticalRadioButtons opts={radioOptions} />;
};
