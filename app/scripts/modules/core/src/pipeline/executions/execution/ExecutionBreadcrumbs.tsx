import React, { useState, useEffect } from 'react';
import { UISref } from '@uirouter/react';

import { ExecutionInformationService } from './executionInformation.service';
import { IExecution } from 'core/domain';

export interface IExecutionBreadcrumbsProps {
  execution: IExecution;
}

export const ExecutionBreadcrumbs: React.FC<IExecutionBreadcrumbsProps> = ({ execution }) => {
  const [executions, setExecutions] = useState([]);

  const informationService = new ExecutionInformationService();

  useEffect(() => {
    (async () => {
      const execs = await informationService.getAllParentExecutions(execution);
      setExecutions(execs);
    })();
  }, []);

  return (
    <div>
      {executions &&
        executions.length > 1 &&
        [...executions].reverse().map((execution, index, array) => (
          <React.Fragment key={execution.id}>
            <UISref
              to="home.applications.application.pipelines.executionDetails.execution"
              params={{
                application: execution.application,
                executionId: execution.id,
                executionParams: {
                  application: execution.application,
                  executionId: execution.id,
                },
              }}
              options={{
                inherit: false,
                reload: 'home.applications.application.pipelines.executionDetails',
              }}
            >
              <a style={{ display: 'inline' }} className="execution-build-number clickable">
                {execution.name}
              </a>
            </UISref>
            {index !== array.length - 1 && <span key={`span-${execution.id}`}> / </span>}
          </React.Fragment>
        ))}
    </div>
  );
};
