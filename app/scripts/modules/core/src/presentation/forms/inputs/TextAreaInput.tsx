import React from 'react';

import { orEmptyString, validationClassName } from './utils';
import { IFormInputProps, OmitControlledInputPropsFrom } from './interface';

interface ITextAreaInputProps extends IFormInputProps, OmitControlledInputPropsFrom<React.TextareaHTMLAttributes<any>> {
  inputClassName?: string;
}

export class TextAreaInput extends React.Component<ITextAreaInputProps> {
  public render() {
    const { value, validation, inputClassName, ...otherProps } = this.props;
    const className = `TextAreaInput form-control ${orEmptyString(inputClassName)} ${validationClassName(validation)}`;
    return <textarea className={className} autoComplete="off" value={orEmptyString(value)} {...otherProps} />;
  }
}
