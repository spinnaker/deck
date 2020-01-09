import React from 'react';

import { orEmptyString, validationClassName } from './utils';
import { IFormInputProps, OmitControlledInputPropsFrom } from './interface';
import get = Reflect.get;

export interface ITextInputProps extends IFormInputProps, OmitControlledInputPropsFrom<React.InputHTMLAttributes<any>> {
  inputClassName?: string;
}

export class TextInput extends React.Component<ITextInputProps> {
  public render() {
    const { value, validation, inputClassName, ...otherProps } = this.props;
    const className = `TextInput form-control ${orEmptyString(inputClassName)} ${validationClassName(validation)}`;
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ paddingRight: '5px', fontSize: '13px' }}>{get(otherProps, 'prefix') ?? ''}</div>
        <input className={className} type="text" autoComplete="off" value={orEmptyString(value)} {...otherProps} />
      </div>
    );
  }
}
