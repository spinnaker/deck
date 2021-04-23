import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Subscription } from 'rxjs';

import { NotifierService } from './notifier.service';

import './notifier.component.less';
import 'react-toastify/dist/ReactToastify.min.css';

export class Notifier extends React.Component {
  private subscription: Subscription;

  constructor(props: {}) {
    super(props);
  }

  public componentDidMount() {
    this.subscription = NotifierService.messageStream.subscribe((message) => {
      if (message.action === 'remove') {
        toast.dismiss(message.key);
      } else {
        const existing = toast.isActive(message.key);
        if (existing) {
          toast.update(message.key, { render: message.content, ...message.options });
        } else {
          toast(message.content, { toastId: message.key, ...message.options });
        }
      }
    });
  }

  public componentWillUnmount() {
    this.subscription?.unsubscribe();
  }

  public render() {
    return <ToastContainer position="bottom-right" autoClose={false} newestOnTop={true} closeOnClick={false} />;
  }
}
