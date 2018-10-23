import * as React from 'react';
import { Option } from 'react-select';
import VirtualizedSelect from 'react-virtualized-select';
import { ArrayHelpers, FieldArray, getIn } from 'formik';

import { FormikFormField, IFormInputProps, StandardFieldLayout, TextInput } from 'core/presentation';

import './Applications.css';

export interface IApplicationsPickerProps {
  label?: React.ReactNode;
  name: string; // path to formik array
  applications: string[];
}

const makeOption = (app: string) => ({ value: app, label: app });

/**
 * This component supports multiple selection of applications.
 * The dropdown application list filters out already-selected apps.
 */
export class FormikApplicationsPicker extends React.Component<IApplicationsPickerProps> {
  public render() {
    const { label, applications, name } = this.props;

    const TrashButton = ({ arrayHelpers, index }: { arrayHelpers: ArrayHelpers; index: number }) => (
      <button type="button" onClick={() => arrayHelpers.remove(index)} className="nostyle">
        <i className="fas fa-trash-alt" />
      </button>
    );

    const Application = (props: IFormInputProps) => {
      const appClassName = 'body-small zombie-label flex-1 sp-padding-xs-yaxis sp-padding-s-xaxis sp-margin-xs-yaxis';
      const isError = props.validation.validationStatus === 'error';
      // When there is an error, render a disabled TextInput with failed validation, else render the weird box ui
      return isError ? <TextInput disabled={true} {...props} /> : <p className={appClassName}>{props.field.value}</p>;
    };

    return (
      <FieldArray
        name={name}
        render={arrayHelpers => {
          const selectedApplications: string[] = getIn(arrayHelpers.form.values, name) || [];
          const isAppSelected = (app: string) => !selectedApplications.includes(app);
          const options: Array<Option<string>> = applications.filter(isAppSelected).map(makeOption);

          return (
            <div className="Applications">
              {selectedApplications.map((app, index) => (
                <FormikFormField
                  key={app}
                  name={`${name}[${index}]`}
                  label={label}
                  input={Application}
                  actions={<TrashButton arrayHelpers={arrayHelpers} index={index} />}
                  touched={true}
                />
              ))}

              <StandardFieldLayout
                label={label}
                input={
                  <VirtualizedSelect
                    ignoreAccents={false} /* for typeahead performance with long lists */
                    options={options}
                    onChange={(item: Option<string>) => arrayHelpers.push(item.value)}
                    className="body-small"
                  />
                }
              />
            </div>
          );
        }}
      />
    );
  }
}
