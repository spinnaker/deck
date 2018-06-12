import * as React from 'react';
import { truncate, isEqual } from 'lodash';
import { parseSpelExpressions } from './spel2js.templateParser';

export interface ISpelError {
  message: string;
  context: string;
  contextTruncated: string;
}

export interface IExpressionChange {
  value: string;
  spelError: ISpelError;
  spelPreview: string;
}

export interface IExpressionInputProps {
  value: string;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  onExpressionChange: (expressionChange: IExpressionChange) => void;
  placeholder?: string;
  context?: object;
}

export class ExpressionInput extends React.Component<IExpressionInputProps> {
  public static defaultProps = { context: {}, placeholder: '' };

  private static evaluateExpression(context: object, value: string): IExpressionChange {
    if (!value) {
      return { value, spelError: null, spelPreview: '' };
    }

    const stringify = (obj: any): string => {
      return obj === null ? 'null' : obj === undefined ? 'undefined' : JSON.stringify(obj, null, 2);
    };

    try {
      const exprs = parseSpelExpressions(value);
      const results = exprs.map(expr => expr.eval(context));
      return { value, spelError: null, spelPreview: results.join('') };
    } catch (err) {
      const spelError: ISpelError = {
        message: null,
        context: null,
        contextTruncated: null,
      };

      if (err.name && err.message) {
        if (err.name === 'NullPointerException' && err.state && err.state.activeContext) {
          spelError.context = stringify(err.state.activeContext.peek());
          spelError.contextTruncated = truncate(spelError.context, { length: 200 });
        }
        spelError.message = `${err.name}: ${err.message}`;
      } else {
        try {
          spelError.message = JSON.stringify(err);
        } catch (ignored) {
          spelError.message = err.toString();
        }
      }

      return { value, spelError, spelPreview: null };
    }
  }

  public componentDidUpdate(prevProps: IExpressionInputProps) {
    const { context, value } = this.props;
    if (value !== prevProps.value || !isEqual(context, prevProps.context)) {
      const expressionChange = ExpressionInput.evaluateExpression(context, value);
      this.props.onExpressionChange(expressionChange);
    }
  }

  public render(): JSX.Element {
    const { value, placeholder, onChange } = this.props;

    return (
      <input
        autoComplete="off"
        className="form-control"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  }
}
