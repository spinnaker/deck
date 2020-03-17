import React from 'react';
import { FormikFormField } from 'core/presentation';

export interface ITaskReasonProps {
  onChange: (reason: string) => void;
  reason: string;
  useSystemLayout?: boolean;
}

export class TaskReason extends React.Component<ITaskReasonProps> {
  public render() {
    const label = 'Reason';
    const field = (
      <textarea
        className="form-control"
        value={this.props.reason}
        onChange={event => this.props.onChange(event.target.value)}
        ng-model="vm.command.reason"
        rows={3}
        placeholder="(Optional) anything that might be helpful to explain the reason for this change; HTML is okay"
      />
    );
    return this.props.useSystemLayout ? (
      <FormikFormField label={label} name="reason" input={() => field} />
    ) : (
      <div className="row" style={{ marginTop: '10px', marginBottom: '10px' }}>
        <div className="col-md-3 sm-label-right">{label}</div>
        <div className="col-md-7">{field}</div>
      </div>
    );
  }
}
