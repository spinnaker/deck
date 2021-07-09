import React from 'react';

import { BuildServiceType } from 'core/ci/igor.service';

import { BaseBuildTrigger, IBaseBuildTriggerConfigProps } from '../baseBuild/BaseBuildTrigger';

export class TravisTrigger extends React.Component<IBaseBuildTriggerConfigProps> {
  public render() {
    return (
      <div>
        <BaseBuildTrigger {...this.props} buildTriggerType={BuildServiceType.Travis} />
        <p />
        <div className="well alert alert-info" role="alert">
          <p>
            You can read properties from Travis builds by logging them in the build log using one of the following
            formats:
          </p>
          <pre>
            SPINNAKER_PROPERTY_key1=value1
            <br />
            SPINNAKER_PROPERTY_key2=value2
            <br />
            SPINNAKER_CONFIG_JSON={'{'}"key3": "value3", "key4": "value4"{'}'}
          </pre>
          The properties will be available in the trigger context under the key <code>properties</code>.<br />
          Example using SpEL:{' '}
          <code>
            ${'{'}trigger.properties.key2{'}'}
          </code>
          .
        </div>
      </div>
    );
  }
}
