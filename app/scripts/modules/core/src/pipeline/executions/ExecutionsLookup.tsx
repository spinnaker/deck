import * as React from 'react';
import { ReactInjector } from 'core/reactShims';

export class ExecutionsLookup extends React.Component {
  public render() {
    const { params } = ReactInjector.$state;
    return <LookupExecution executionId={params.executionid} />;
  }
}

interface ILookupExecutionProps {
  executionId: string;
}

interface ILookupExecutionState {
  pending: boolean;
}

class LookupExecution extends React.Component<ILookupExecutionProps, ILookupExecutionState> {
  constructor(props: ILookupExecutionProps) {
    super(props);
    this.state = { pending: true };
  }

  public componentDidMount(): void {
    const { executionId } = this.props;
    const { executionService, $state } = ReactInjector;
    executionService
      .getExecution(executionId)
      .then(execution => {
        $state.go('home.applications.application.pipelines.executionDetails.execution', {
          application: execution.application,
          executionId,
        });
      })
      .catch(() => {
        this.setState({ pending: false });
      });
  }

  public render() {
    const { executionId } = this.props;
    const { pending } = this.state;
    const title = pending ? 'Redirecting...' : 'Execution Not Found';
    const splainer = pending ? 'Looking up the execution:' : "Please check your URL - we can't find any data for";

    return (
      <div className="application">
        <div>
          <h2 className="text-center">{title}</h2>
          <p className="text-center" style={{ marginBottom: '20px' }}>
            {splainer} <em>{executionId}</em>.
          </p>
        </div>
      </div>
    );
  }
}
