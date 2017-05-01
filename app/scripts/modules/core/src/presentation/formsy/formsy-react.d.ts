// https://github.com/christianalfoni/formsy-react/issues/191#issuecomment-144872142

// FormComponent.ts
// Type wrapper for Formsy-React
// Project: https://github.com/christianalfoni/formsy-react

declare module 'formsy-react' {

  interface ValidationErrors {
    [key: string]: string;
  }

  // This is declared for a reference to Formsy.Mixin in FormComponent.ts
  const Mixin: any;

  interface IFormProps {
    [key: string]: string | Function | boolean | ValidationErrors | React.ReactElement<any>[];
    className?: string;
    mapping?: Function;
    onSuccess?: Function;
    onError?: Function;
    onSubmit?: Function;
    onValidSubmit?: Function;
    onInvalidSubmit?: Function;
    onSubmitted?: Function;
    onValid?: Function;
    onInvalid?: Function;
    onChange?: Function;
    validationErrors?: ValidationErrors;
    preventExternalValidation?: boolean;
  }

  class Form extends React.Component<IFormProps, any> { }
  const Decorator: () => (target) => any;
}
