import autoBindMethods from 'class-autobind-decorator';
import * as React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';

import { CustomMenu, CustomToggle } from '@spinnaker/core';

import { ISlackConfig, NetflixSettings } from '../netflix.settings';
import { FeedbackModal } from './FeedbackModal';

import './feedback.less';

interface IFeedbackProps {
}

interface IFeedbackState {
  slackConfig: ISlackConfig;
  open: boolean;
  isMac: boolean;
  showModal: boolean;
}

@autoBindMethods
export class Feedback extends React.Component<IFeedbackProps, IFeedbackState> {
  constructor(props: IFeedbackProps) {
    super(props);
    this.state = {
      slackConfig: NetflixSettings.feedback ? NetflixSettings.feedback.slack : null,
      open: false,
      isMac: navigator.platform.toLowerCase().includes('mac'),
      showModal: false
    };
  }

  public setOpen(open: boolean) {
    this.setState({open: open});
  }

  public showModal(): void {
    this.setModal(true);
  }

  public setModal(show: boolean): void {
    this.setState({showModal: show});
  }

  public render() {
    const slackConfig = this.state.slackConfig;
    const slackUrl: string = slackConfig ? this.state.isMac ? `slack://channel?id=${slackConfig.helpChannel}&team=${slackConfig.team}`
                                              : `https://${slackConfig.teamName}.slack.com/messages/${slackConfig.helpChannelName}`
                                              : '';
    const slackTarget: string = this.state.isMac ? '' : '_blank';
    return (
      <Dropdown id="feedback-dropdown" componentClass="li" className="feedback-nav">
        <CustomToggle bsRole="toggle">
          <span className="glyphicon glyphicon-question-sign"/>
          <span className="hidden-xs hidden-sm">Help</span>
        </CustomToggle>
        <CustomMenu bsRole="menu">
          <li role="presentation">
            <a onClick={this.showModal}>
              <span className="glyphicon glyphicon-envelope"/>
              Create an issue in JIRA
            </a>
          </li>
          { slackConfig && (
            <MenuItem href={slackUrl} target={slackTarget}>
              <span className="icon"><span className="glyphicon icon-bubbles"/></span>
              Talk to us on Slack
            </MenuItem>
          )}
          <MenuItem href="https://confluence.netflix.com/display/ENGTOOLS/Spinnaker" target="_blank">
            <span className="glyphicon glyphicon-file"/> Documentation
          </MenuItem>
        </CustomMenu>
        <FeedbackModal show={this.state.showModal} showCallback={this.setModal}/>
      </Dropdown>
    );
  }
}
