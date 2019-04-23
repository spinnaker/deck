import * as React from 'react';
import Select, { Option } from 'react-select';
import { FormikProps } from 'formik';

import { IWizardPageComponent, ReactInjector } from '@spinnaker/core';

import {
  ITencentServerGroupCommand,
  ITencentForwardLoadBalancer,
  ITencentLbListenerMap,
} from '../../serverGroupConfiguration.service';

import { IALBListener } from 'tencent/domain';

export interface IServerGroupLoadBalancersProps {
  formik: FormikProps<ITencentServerGroupCommand>;
}
interface ITencentLocation {
  isL7: boolean;
  domain: string;
  domainList: string[];
  url: string;
  urlList: string[];
  selectedListener: IALBListener;
}
interface ITencentLocationMap {
  [key: string]: ITencentLocation;
}
export interface IServerGroupLoadBalancersState {
  refreshing: boolean;
  listenerLocationMap: ITencentLocationMap;
}

export class ServerGroupLoadBalancers
  extends React.Component<IServerGroupLoadBalancersProps, IServerGroupLoadBalancersState>
  implements IWizardPageComponent<ITencentServerGroupCommand> {
  public state = {
    refreshing: false,
    listenerLocationMap: {} as ITencentLocationMap,
  };

  public validate(values: ITencentServerGroupCommand) {
    const errors = {} as any;
    const { listenerLocationMap } = this.state;
    if (values.viewState.dirty.loadBalancers) {
      errors.loadBalancers = 'You must confirm the removed load balancers.';
    }

    if (values.forwardLoadBalancers.length) {
      if (values.forwardLoadBalancers.some(flb => !flb.loadBalancerId)) {
        errors.loadBalancers = 'Load Balancer required.';
      } else if (values.forwardLoadBalancers.some(flb => !flb.listenerId)) {
        errors.loadBalancers = 'Listener required.';
      } else if (
        values.forwardLoadBalancers.some(
          (flb, index) => listenerLocationMap[index] && listenerLocationMap[index].isL7 && !flb.locationId,
        )
      ) {
        errors.loadBalancers = 'Domain and URL required.';
      } else if (
        values.forwardLoadBalancers.some(
          flb => !flb.targetAttributes || !flb.targetAttributes[0].port || !flb.targetAttributes[0].weight,
        )
      ) {
        errors.loadBalancers = 'Port and Weight required.';
      }
    }
    return errors;
  }

  private updateLoadBalancers(): void {
    this.props.formik.setFieldValue('forwardLoadBalancers', this.props.formik.values.forwardLoadBalancers);
  }

  private addLoadBalancer(): void {
    const { values } = this.props.formik;
    values.forwardLoadBalancers.push({
      loadBalancerId: '',
      listenerId: '',
      locationId: '',
      targetAttributes: [
        {
          port: null,
          weight: null,
        },
      ],
    });
    this.updateLoadBalancers();
  }

  private removeLoadBalancer(index: number): void {
    this.props.formik.values.forwardLoadBalancers.splice(index, 1);
    this.updateLoadBalancers();
  }

  private loadBalancerChanged(forwardLoadBalancer: ITencentForwardLoadBalancer, loadBalancerId: string): void {
    forwardLoadBalancer.loadBalancerId = loadBalancerId;
    forwardLoadBalancer.listenerId = '';
    forwardLoadBalancer.locationId = '';
    this.updateLoadBalancers();
    this.refreshLBListenerMap();
  }

  private refreshLBListenerMap = () => {
    const { values } = this.props.formik;
    this.setState({ refreshing: true });
    const configurationService: any = ReactInjector.providerServiceDelegate.getDelegate(
      values.cloudProvider || values.selectedProvider,
      'serverGroup.configurationService',
    );
    configurationService.refreshLoadBalancerListenerMap(values).then(() => {
      this.setState({
        refreshing: false,
        listenerLocationMap: {},
      });
    });
  };

  private listenerChanged(forwardLoadBalancer: ITencentForwardLoadBalancer, listenerId: string, index: number) {
    forwardLoadBalancer.listenerId = listenerId;
    forwardLoadBalancer.locationId = '';
    this.updateLoadBalancers();
    const selectedListener = this.props.formik.values.backingData.filtered.lbListenerMap[
      forwardLoadBalancer.loadBalancerId
    ].find(item => item.listenerId === listenerId);
    this.setState({
      listenerLocationMap: {
        ...this.state.listenerLocationMap,
        [index]: {
          domain: '',
          url: '',
          urlList: [],
          selectedListener,
          isL7: this.isL7(selectedListener.protocol),
          domainList: this.getDomainList(selectedListener),
        },
      },
    });
  }

  private portChanged(forwardLoadBalancer: ITencentForwardLoadBalancer, port: number) {
    forwardLoadBalancer.targetAttributes[0].port = port;
    this.updateLoadBalancers();
  }

  private weightChanged(forwardLoadBalancer: ITencentForwardLoadBalancer, weight: number) {
    forwardLoadBalancer.targetAttributes[0].weight = weight;
    this.updateLoadBalancers();
  }

  public clearWarnings(key: 'loadBalancers'): void {
    this.props.formik.values.viewState.dirty[key] = null;
    this.props.formik.validateForm();
  }

  private isL7 = (protocol: string): boolean => {
    return protocol === 'HTTP' || protocol === 'HTTPS';
  };

  private domainChanged = (forwardLoadBalancer: ITencentForwardLoadBalancer, domain: string, index: number) => {
    const { listenerLocationMap } = this.state;
    forwardLoadBalancer.locationId = '';
    const listenerLocation = listenerLocationMap[index];
    this.setState({
      listenerLocationMap: {
        ...listenerLocationMap,
        [index]: {
          ...listenerLocation,
          domain: domain,
          url: '',
          urlList: this.getUrlList(listenerLocation.selectedListener, domain),
        },
      },
    });
  };

  private urlChanged = (forwardLoadBalancer: ITencentForwardLoadBalancer, url: string, index: number) => {
    const { listenerLocationMap } = this.state;
    const listenerLocation = listenerLocationMap[index];
    const rule = listenerLocation.selectedListener.rules.find(
      r => r.domain === listenerLocation.domain && r.url === url,
    );
    forwardLoadBalancer.locationId = rule.locationId;
    this.updateLoadBalancers();
    this.setState({
      listenerLocationMap: {
        ...listenerLocationMap,
        [index]: {
          ...listenerLocation,
          url,
        },
      },
    });
  };

  private getDomainList = (selectedListener: IALBListener): string[] => {
    return selectedListener.rules && selectedListener.rules.length
      ? [...new Set(selectedListener.rules.map(rule => rule.domain))]
      : [];
  };

  private getUrlList = (selectedListener: IALBListener, domain: string): string[] => {
    return selectedListener && selectedListener.rules && selectedListener.rules.length && domain
      ? selectedListener.rules.filter(r => r.domain === domain).map(r => r.url)
      : [];
  };

  public componentWillReceiveProps(nextProps: IServerGroupLoadBalancersProps): void {
    const {
      values: {
        forwardLoadBalancers = [],
        backingData: {
          filtered: { lbListenerMap = {} as ITencentLbListenerMap },
        },
        viewState: { submitButtonLabel },
      },
    } = nextProps.formik;
    if (
      submitButtonLabel !== 'Create' &&
      forwardLoadBalancers.length &&
      forwardLoadBalancers.every(flb => !!flb.loadBalancerId)
    ) {
      this.setState({
        listenerLocationMap: {
          ...this.state.listenerLocationMap,
          ...forwardLoadBalancers.reduce((p: ITencentLocationMap, c, index) => {
            const listenerList = lbListenerMap[c.loadBalancerId] || [];
            const selectedListener = listenerList.find(l => l.listenerId === c.listenerId);
            const rule = selectedListener && selectedListener.rules.find(r => r.locationId === c.locationId);
            if (selectedListener) {
              p[index] = {
                domain: (rule && rule.domain) || '',
                url: (rule && rule.url) || '',
                isL7: this.isL7(selectedListener.protocol),
                domainList: this.getDomainList(selectedListener),
                urlList: this.getUrlList(selectedListener, (rule && rule.domain) || ''),
                selectedListener: selectedListener,
              };
            }
            return p;
          }, {}),
        },
      });
    }
  }

  public render() {
    const { values } = this.props.formik;
    const { refreshing, listenerLocationMap } = this.state;
    const loadBalancerOptions: Option[] = (values.backingData.filtered.lbList || []).map(lb => ({
      label: `${lb.name}(${lb.id})`,
      value: lb.id,
    }));
    return (
      <div className="container-fluid form-horizontal">
        <div className="form-group">
          {values.forwardLoadBalancers.map((forwardLoadBalancer, index) => (
            <div key={index} className="col-md-12">
              <div className="wizard-pod">
                <div className="wizard-pod-row header">
                  <div className="wizard-pod-row-title">Load Balancer</div>
                  <div className="wizard-pod-row-contents spread">
                    <div className="col-md-10">
                      <Select
                        value={forwardLoadBalancer.loadBalancerId}
                        required={true}
                        clearable={false}
                        options={loadBalancerOptions}
                        onChange={(option: Option<string>) =>
                          this.loadBalancerChanged(forwardLoadBalancer, option.value)
                        }
                      />
                    </div>
                    <div className="col-md-2">
                      <a className="sm-label clickable" onClick={() => this.removeLoadBalancer(index)}>
                        <span className="glyphicon glyphicon-trash" />
                      </a>
                    </div>
                  </div>
                </div>
                {forwardLoadBalancer.loadBalancerId ? (
                  <div className="wizard-pod-row">
                    <div className="wizard-pod-row-title">Listener</div>
                    <div className="wizard-pod-row-contents">
                      <div className="wizard-pod-row-data">
                        <div className="col-md-10">
                          {values.backingData.filtered.lbListenerMap[forwardLoadBalancer.loadBalancerId] ? (
                            <Select
                              isLoading={refreshing}
                              value={forwardLoadBalancer.listenerId}
                              required={true}
                              clearable={false}
                              options={values.backingData.filtered.lbListenerMap[
                                forwardLoadBalancer.loadBalancerId
                              ].map(lb => ({ label: `${lb.listenerName}(${lb.listenerId})`, value: lb.listenerId }))}
                              onChange={(option: Option<string>) =>
                                this.listenerChanged(forwardLoadBalancer, option.value, index)
                              }
                            />
                          ) : (
                            'No listeners found in the selected LoadBalancer'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {forwardLoadBalancer.listenerId && listenerLocationMap[index] && listenerLocationMap[index].isL7 ? (
                  <div className="wizard-pod-row">
                    <div className="wizard-pod-row-title">Domain</div>
                    <div className="wizard-pod-row-contents">
                      <div className="wizard-pod-row-data">
                        <div className="col-md-10">
                          {listenerLocationMap[index].domainList && listenerLocationMap[index].domainList.length ? (
                            <Select
                              value={listenerLocationMap[index].domain}
                              required={true}
                              clearable={false}
                              options={listenerLocationMap[index].domainList.map(d => ({
                                label: d,
                                value: d,
                              }))}
                              onChange={(option: Option<string>) =>
                                this.domainChanged(forwardLoadBalancer, option.value, index)
                              }
                            />
                          ) : (
                            'No domain found in the selected listener'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {forwardLoadBalancer.listenerId &&
                listenerLocationMap[index] &&
                listenerLocationMap[index].isL7 &&
                listenerLocationMap[index].domain ? (
                  <div className="wizard-pod-row">
                    <div className="wizard-pod-row-title">URL</div>
                    <div className="wizard-pod-row-contents">
                      <div className="wizard-pod-row-data">
                        <div className="col-md-10">
                          {listenerLocationMap[index].urlList && listenerLocationMap[index].urlList.length ? (
                            <Select
                              value={listenerLocationMap[index].url}
                              required={true}
                              clearable={false}
                              options={listenerLocationMap[index].urlList.map(d => ({
                                label: d,
                                value: d,
                              }))}
                              onChange={(option: Option<string>) =>
                                this.urlChanged(forwardLoadBalancer, option.value, index)
                              }
                            />
                          ) : (
                            'No url found in the selected URL'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="wizard-pod-row">
                  <div className="wizard-pod-row-title">Target Attributes</div>
                  <div className="wizard-pod-row-contents">
                    <div className="wizard-pod-row-data">
                      <div className="col-md-5">
                        <label>Port </label>
                        <input
                          type="number"
                          className="form-control input-sm inline-number"
                          style={{ width: '80%' }}
                          value={
                            (forwardLoadBalancer.targetAttributes[0] && forwardLoadBalancer.targetAttributes[0].port) ||
                            ''
                          }
                          min={1}
                          max={65535}
                          placeholder="1~65535"
                          onChange={e => this.portChanged(forwardLoadBalancer, parseInt(e.target.value, 10))}
                          required={true}
                        />
                      </div>
                      <div className="col-md-5">
                        <label>Weight </label>
                        <input
                          type="number"
                          className="form-control input-sm inline-number"
                          style={{ width: '70%' }}
                          value={
                            (forwardLoadBalancer.targetAttributes[0] &&
                              forwardLoadBalancer.targetAttributes[0].weight) ||
                            ''
                          }
                          min={1}
                          max={100}
                          placeholder="1~100"
                          onChange={e => this.weightChanged(forwardLoadBalancer, parseInt(e.target.value, 10))}
                          required={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loadBalancerOptions.length === 0 ? (
            <div className="form-control-static text-center">
              No load balancers found in the selected account/region/VPC
            </div>
          ) : values.forwardLoadBalancers.length < 5 ? (
            <div className="col-md-12">
              <table className="table table-condensed packed">
                <tbody>
                  <tr>
                    <td>
                      <button type="button" className="add-new col-md-12" onClick={() => this.addLoadBalancer()}>
                        <span className="glyphicon glyphicon-plus-sign" />
                        Add New Load Balancer
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="form-control-static text-center">
              Up to 5 Load Balancers can be added for a server group
            </div>
          )}
        </div>
      </div>
    );
  }
}
