import * as React from 'react';
import * as Select from 'react-select';
import { ReactSelectInput } from '@spinnaker/core';

import { ISlackChannel, SlackReader } from './SlackReader';

export interface ISlackChannelSelectorProps {
  channel: ISlackChannel;
  callback: (name: string, value: any) => void;
}

export interface ISlackChannelSelectorState {
  channels: ISlackChannel[];
  selected: ISlackChannel;
  loading: boolean;
}

export default class SlackChannelSelector extends React.Component<
  ISlackChannelSelectorProps,
  ISlackChannelSelectorState
> {
  public constructor(props: ISlackChannelSelectorProps) {
    super(props);
    this.state = {
      channels: [],
      selected: this.props.channel || null,
      loading: true,
    };
  }

  public componentDidMount() {
    SlackReader.getChannels().then((channels: ISlackChannel[]) =>
      this.setState({
        channels,
        loading: false,
      }),
    );
  }

  private onChange = (evt: Select.Option<ISlackChannel>) => {
    const channel = evt ? evt.value : null;
    const { callback } = this.props;
    callback('slackChannel', channel || {});
    this.setState({ selected: channel });
  };

  public render() {
    const { channels, loading, selected } = this.state;

    return (
      <div className="form-group row">
        <div className="col-sm-3 sm-label-right">Slack Channel</div>
        <div className="col-sm-9">
          <ReactSelectInput
            inputClassName="form-control input-sm"
            mode="VIRTUALIZED"
            options={channels.map((ch: ISlackChannel) => ({ value: ch, label: ch.name }))}
            value={selected && ({ value: selected, label: selected.name } as Select.Option<ISlackChannel>)}
            onChange={this.onChange}
            isLoading={loading}
          />
        </div>
      </div>
    );
  }
}
