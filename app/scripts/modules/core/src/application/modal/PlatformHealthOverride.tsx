import * as React from 'react';
import { isEqual } from 'lodash';

import { IServerGroupCommand } from 'core/serverGroup';
import { HelpField } from 'core/help/HelpField';

export interface IPlatformHealthOverrideProps {
  command: IServerGroupCommand;
  onChange: (healthProviderNames: string[]) => void;
  platformHealthType: string;
  showHelpDetails?: boolean;
}

export class PlatformHealthOverride extends React.Component<IPlatformHealthOverrideProps> {
  private clicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const interestingHealthProviderNames = event.target.checked ? [this.props.platformHealthType] : null;
    this.props.onChange(interestingHealthProviderNames);
  };

  public render() {
    return (
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            checked={isEqual(this.props.command.interestingHealthProviderNames, [this.props.platformHealthType])}
            onChange={this.clicked}
          />
          Consider only {this.props.platformHealthType} health
        </label>{' '}
        <HelpField id="application.platformHealthOnly" expand={this.props.showHelpDetails} />
      </div>
    );
  }
}
