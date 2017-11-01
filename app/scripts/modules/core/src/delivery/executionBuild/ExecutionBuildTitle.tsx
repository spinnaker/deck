/*
 * Copyright 2017 Schibsted ASA.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';
import { BindAll } from 'lodash-decorators';

import { IExecutionBuildLinkProps } from './ExecutionBuildLink';
import { ReactInjector } from 'core/reactShims';

export interface IExecutionBuildTitleProps extends IExecutionBuildLinkProps {
  defaultToTimestamp?: boolean;
}

@BindAll()
export class ExecutionBuildTitle extends React.Component<IExecutionBuildTitleProps, {}> {

  public static defaultProps: Partial<IExecutionBuildTitleProps> = {
    defaultToTimestamp: false
  };

  constructor(props: IExecutionBuildTitleProps) {
    const { executionsTransformer } = ReactInjector;
    super(props);
    if (!props.execution.buildInfo) {
      executionsTransformer.addBuildInfo(props.execution);
    }
  }

  public render() {
    return (
      <span>
        { this.props.execution.trigger.parentPipelineName &&
          <span>{this.props.execution.trigger.parentPipelineName}</span>
        }
        { this.props.execution.buildInfo && this.props.execution.buildInfo.number &&
          <span><span className="build-label">Build</span> #{this.props.execution.buildInfo.number}</span>
        }
        { this.props.defaultToTimestamp && !this.props.execution.trigger.parentPipelineName && !this.props.execution.buildInfo &&
          <span>{new Date(this.props.execution.startTime).toLocaleString()}</span>
        }
      </span>
    );
  }
}
