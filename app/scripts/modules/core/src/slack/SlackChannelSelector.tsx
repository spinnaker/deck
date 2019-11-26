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

export default function SlackChannelSelector({ channel, callback }: ISlackChannelSelectorProps) {
  const [channels, setChannels] = React.useState([]);
  const [selectedChannel, setSelectedChannel] = React.useState(channel);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    SlackReader.getChannels().then((ch: ISlackChannel[]) => {
      setChannels(ch);
      setIsLoading(false);
    });
  }, []);

  const onInputChange = (evt: Select.Option<ISlackChannel>) => {
    const newChannel = evt ? evt.target.value : null;
    callback('slackChannel', newChannel || {});
    setSelectedChannel(newChannel);
  };

  return (
    <div className="form-group row">
      <div className="col-sm-3 sm-label-right">Slack Channel</div>
      <div className="col-sm-9">
        <ReactSelectInput
          inputClassName="form-control input-sm"
          mode="VIRTUALIZED"
          options={channels.map((ch: ISlackChannel) => ({ value: ch, label: ch.name }))}
          value={selectedChannel && { value: selectedChannel, label: selectedChannel.name }}
          onChange={onInputChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
