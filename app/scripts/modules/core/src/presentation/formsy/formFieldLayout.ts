import { HTMLAttributes } from 'react';

/** An interface which Formsy form field layouts should accept as props */
export interface IFormFieldLayoutProps extends HTMLAttributes<any> {
  _label?: React.ReactElement<any>;
  _input?: React.ReactElement<any>;
  _help?: React.ReactElement<any>;
  _error?: React.ReactElement<any>;
  showRequired?: boolean;
  showError?: boolean;
}
