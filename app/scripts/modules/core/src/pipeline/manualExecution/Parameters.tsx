import * as React from 'react';
import { FormikProps } from 'formik';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import { HelpField } from 'core/help';
import { IParameter, IPipelineCommand } from 'core/domain';
import { FormikFormField, ReactSelectInput, TextInput } from 'core/presentation';

import 'react-day-picker/lib/style.css';

export interface IParametersProps {
  formik: FormikProps<IPipelineCommand>;
  parameters: IParameter[];
}

export class Parameters extends React.Component<IParametersProps> {
  private dateSelected = (date: Date, name: string): void => {
    this.props.formik.setFieldValue('parameter.' + name, date.toISOString().slice(0, 10));
  };

  private shouldInclude = (p: IParameter) => {
    const { values } = this.props.formik;
    if (p.conditional) {
      const comparingTo = values.parameters[p.conditional.parameter];
      const value = p.conditional.comparatorValue;
      switch (p.conditional.comparator) {
        case '>':
          return parseFloat(comparingTo) > parseFloat(value);
        case '>=':
          return parseFloat(comparingTo) >= parseFloat(value);
        case '<':
          return parseFloat(comparingTo) < parseFloat(value);
        case '<=':
          return parseFloat(comparingTo) <= parseFloat(value);
        case '!=':
          return comparingTo !== value;
        case '=':
          return comparingTo === value;
      }
    }
    return true;
  };

  public render() {
    const { parameters } = this.props;
    const hasRequiredParameters = parameters.some(p => p.required);
    const visibleParameters = parameters.filter(p => !p.conditional || this.shouldInclude(p));
    return (
      <>
        <p className="manual-execution-parameters-description">
          This pipeline is parameterized. Please enter values for the parameters below.
        </p>
        {visibleParameters &&
          visibleParameters.map((parameter, i) => {
            return (
              <div className="form-group" key={i}>
                <div className="col-md-4 sm-label-right break-word">
                  {parameter.name}
                  {parameter.required && <span>*</span>}
                  {parameter.description && <HelpField content={parameter.description} />}
                </div>
                {!parameter.hasOptions && parameter.constraint === 'date' && (
                  <div className="col-md-6">
                    <DayPickerInput
                      format={'yyyy-MM-dd'}
                      onDayChange={(date: Date) => this.dateSelected(date, parameter.name)}
                    />
                  </div>
                )}
                {!parameter.hasOptions && !parameter.constraint && (
                  <div className="col-md-6">
                    <FormikFormField
                      name={'parameters.' + parameter.name}
                      fastField={false}
                      input={props => <TextInput {...props} inputClassName={'form-control input-sm'} />}
                      required={parameter.required}
                    />
                  </div>
                )}
                {parameter.hasOptions && (
                  <div className="col-md-6">
                    <FormikFormField
                      name={'parameters.' + parameter.name}
                      fastField={false}
                      input={props => (
                        <ReactSelectInput
                          {...props}
                          clearable={false}
                          inputClassName={'parameter-option-select'}
                          options={parameter.options.map(o => ({ label: o.value, value: o.value }))}
                        />
                      )}
                      required={parameter.required}
                    />
                  </div>
                )}
                {hasRequiredParameters && (
                  <div className="form-group">
                    <div className="col-md-4 col-md-offset-4">
                      <em>* Required</em>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </>
    );
  }
}
