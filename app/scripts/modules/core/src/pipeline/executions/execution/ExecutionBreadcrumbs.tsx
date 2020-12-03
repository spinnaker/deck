import React, { MouseEventHandler } from 'react';
import { useSref, useCurrentStateAndParams } from '@uirouter/react';
import ReactGA from 'react-ga';

import { ExecutionInformationService } from './executionInformation.service';
import { IExecution } from 'core/domain';

export interface IExecutionBreadcrumbsProps {
  execution: IExecution;
}

export const ExecutionBreadcrumbs = ({ execution }: IExecutionBreadcrumbsProps) => {
  const parentExecutions = React.useMemo(() => {
    return new ExecutionInformationService()
      .getAllParentExecutions(execution)
      .filter((x) => x !== execution)
      .reverse();
  }, []);

  const label = parentExecutions.length === 1 ? 'Parent Execution' : 'Parent Executions';

  return (
    <div>
      <span>{label}: </span>
      {parentExecutions.map((execution, index, array) => (
        <React.Fragment key={execution.id}>
          <ExecutionPermaLink execution={execution} />
          {index !== array.length - 1 && <i className="fas fa-angle-right execution-breadcrumb-marker"></i>}
        </React.Fragment>
      ))}
    </div>
  );
};

function ExecutionPermaLink({ execution }: IExecutionBreadcrumbsProps) {
  const { application, id: executionId } = execution;
  const { state } = useCurrentStateAndParams();

  const isProject = state.name.includes('.project.');
  const executionDetails = `home.${isProject ? 'project.' : 'applications.'}application.pipelines.executionDetails`;
  const toState = executionDetails + '.execution';
  const srefParams = { application, executionId };
  const srefOptions = { reload: executionDetails };
  const sref = useSref(toState, srefParams, srefOptions);

  const handleClick: MouseEventHandler<any> = (e) => {
    ReactGA.event({ category: 'Pipeline', action: 'Execution build number clicked - parent pipeline' });
    sref.onClick(e);
  };

  return (
    <a
      href={sref.href}
      onClick={handleClick}
      style={{ display: 'inline' }}
      className="execution-build-number clickable"
    >
      {execution.name}
    </a>
  );
}
