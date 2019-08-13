import * as React from 'react';

import { ILoadBalancerModalProps, noop } from '@spinnaker/core';
import {
  AmazonLoadBalancerChoiceModal,
  IAmazonLoadBalancerChoiceModalProps,
  IAmazonLoadBalancerChoiceModalDetailsInectedProps,
} from '@spinnaker/amazon';

export class TitusLoadBalancerChoiceModal extends React.Component<ILoadBalancerModalProps> {
  public static defaultProps: Partial<ILoadBalancerModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static show(props: IAmazonLoadBalancerChoiceModalProps): Promise<void> {
    const {
      app: {
        attributes: { cloudProviders = [] },
      },
    } = props;
    return AmazonLoadBalancerChoiceModal.show({
      ...props,
      renderDetails: ({ selectedChoice }: IAmazonLoadBalancerChoiceModalDetailsInectedProps) =>
        selectedChoice.type === 'classic' &&
        cloudProviders.includes('titus') && (
          <div className="alert alert-warning">
            <p>
              <i className="fa fa-exclamation-triangle" /> Note: Classic Load Balancers cannot be used with Titus as
              they do not have <em>IP</em> based target groups.
            </p>
          </div>
        ),
    });
  }
}
