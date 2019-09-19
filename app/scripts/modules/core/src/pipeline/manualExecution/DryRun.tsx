import * as React from 'react';
import { CheckboxInput, FormikFormField } from 'core/presentation';
import { HelpField } from 'core/help';

export const DryRun = () => (
  <div className="form-group">
    <label className="col-md-4 sm-label-right">
      Dry run <HelpField id="execution.dryRun" />
    </label>
    <div className="col-md-6">
      <FormikFormField
        name="dryRun"
        fastField={false}
        input={props => <CheckboxInput {...props} text="Run a test execution" />}
      />
    </div>
  </div>
);
