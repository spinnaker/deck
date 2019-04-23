import * as React from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove, SortEnd } from 'react-sortable-hoc';
import { FormikErrors, FormikProps } from 'formik';
import VirtualizedSelect from 'react-virtualized-select';
import { Application, IWizardPageComponent, SpInput, Tooltip, ValidationMessage } from '@spinnaker/core';

import {
  ALBListenerProtocol,
  IALBListenerCertificate,
  IListenerDescription,
  IALBTargetGroupDescription,
  ITencentApplicationLoadBalancerUpsertCommand,
  IListenerAction,
  IListenerRule,
  IListenerRuleCondition,
  ListenerRuleConditionField,
  IRedirectActionConfig,
  IListenerActionType,
  ITencentHealthCheck,
} from 'tencent/domain';

import { ConfigureOidcConfigModal } from './ConfigureOidcConfigModal';
import { ConfigureRedirectConfigModal } from './ConfigureRedirectConfigModal';
import { Option } from 'react-select';
interface IOption {
  label: string;
  value: string | number;
}
export interface IALBListenersState {
  oidcConfigs: IAuthenticateOidcActionConfig[];
}

const DragHandle = SortableHandle(() => (
  <span className="pipeline-drag-handle clickable glyphicon glyphicon-resize-vertical" />
));
export interface IAuthenticateOidcActionConfig {
  authorizationEndpoint: string;
  clientId: string;
  issuer: string;
  scope: string;
  sessionCookieName: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
}

export interface IALBListenersProps {
  app: Application;
  formik: FormikProps<ITencentApplicationLoadBalancerUpsertCommand>;
  isNewListener?: boolean;
  isNewLB?: boolean;
}

export class ALBListeners extends React.Component<IALBListenersProps, IALBListenersState>
  implements IWizardPageComponent<ITencentApplicationLoadBalancerUpsertCommand> {
  public protocols = ['HTTP', 'HTTPS', 'TCP', 'UDP'];
  private defaultHttpCheck = {
    // httpCheckDomain: undefined,
    httpCheckMethod: 'GET',
    httpCheckPath: '/',
    httpCode: 31,
  };
  private defaultHealthCheck = {
    healthSwitch: 1,
    timeOut: 2,
    intervalTime: 5,
    healthNum: 3,
    unHealthNum: 3,
    showAdvancedSetting: false,
  };
  private httpCheckMethods = ['GET', 'HEAD'];
  private SSLPhrasingOptions = [
    {
      label: 'One-way Authentication',
      value: 'UNIDIRECTIONAL',
    },
    {
      label: 'Two-way Authentication',
      value: 'MUTUAL',
    },
  ];
  private httpCodeOptions = [
    {
      label: '1xx',
      value: 1,
    },
    {
      label: '2xx',
      value: 2,
    },
    {
      label: '3xx',
      value: 4,
    },
    {
      label: '4xx',
      value: 8,
    },
    {
      label: '5xx',
      value: 16,
    },
  ];
  constructor(props: IALBListenersProps) {
    super(props);
    this.state = {
      oidcConfigs: undefined,
    };
  }

  public validate(
    values: ITencentApplicationLoadBalancerUpsertCommand,
  ): FormikErrors<ITencentApplicationLoadBalancerUpsertCommand> {
    const errors = {} as any;
    const missingRuleFields = values.listeners.find(l => {
      const rulesHaveMissingFields = !!l.rules.find(rule => {
        const missingValue = !rule.domain || !rule.url;
        return missingValue;
      });
      return rulesHaveMissingFields;
    });

    if (missingRuleFields) {
      errors.listeners = `Missing fields in rule configuration.`;
    }

    return errors;
  }

  public componentDidMount(): void {}

  private updateListeners(): void {
    this.props.formik.setFieldValue('listeners', this.props.formik.values.listeners);
  }

  private needsCert(listener: IListenerDescription): boolean {
    return listener.protocol === 'HTTPS';
  }

  private isL7(listener: IListenerDescription): boolean {
    return listener.protocol === 'HTTPS' || listener.protocol === 'HTTP';
  }

  private addListenerCertificate(listener: IListenerDescription): void {
    listener.certificate = {
      sslMode: 'UNIDIRECTIONAL',
      certId: '',
      certCaId: undefined,
      ...listener.certificate,
    };
  }

  private listenerProtocolChanged(listener: IListenerDescription, newProtocol: ALBListenerProtocol): void {
    listener.protocol = newProtocol;
    if (listener.protocol === 'HTTPS') {
      listener.port = 443;
      if (!listener.certificate) {
        this.addListenerCertificate(listener);
      }
    } else {
      listener.port = 80;
      listener.certificate = null;
    }
    this.updateListeners();
  }

  private listenerPortChanged(listener: IListenerDescription, newPort: number): void {
    listener.port = newPort;
    this.updateListeners();
  }

  private listenerNameChanged(listener: IListenerDescription, newName: string): void {
    listener.listenerName = newName;
    this.updateListeners();
  }

  private certificateTypeChanged(certificate: IALBListenerCertificate, newType: string): void {
    certificate.sslMode = newType;
    if (certificate.sslMode === 'UNIDIRECTIONAL') {
      certificate.certCaId = undefined;
    }
    this.updateListeners();
  }

  private handleCertificateChanged(
    certificate: IALBListenerCertificate,
    cert: { certId?: string; certCaId?: string },
  ): void {
    Object.assign(certificate, cert);
    this.updateListeners();
  }

  private handleHealthCheckChanged = (
    healthCheck: ITencentHealthCheck,
    key: string,
    newValue: string | number | boolean,
  ): void => {
    healthCheck[key] = newValue;
    this.updateListeners();
  };

  private removeListener(index: number): void {
    this.props.formik.values.listeners.splice(index, 1);
    this.updateListeners();
  }

  private addListener = (): void => {
    this.props.formik.values.listeners.push({
      isNew: true,
      protocol: 'HTTP',
      port: 80,
      healthCheck: { ...this.defaultHealthCheck },
      rules: [],
    });
    this.updateListeners();
  };

  private addRule = (listener: IListenerDescription): void => {
    const newRule: IListenerRule = {
      domain: '',
      url: '',
      healthCheck: this.isL7(listener) ? { ...this.defaultHealthCheck, ...this.defaultHttpCheck } : undefined,
    };

    listener.rules.push(newRule);
    this.updateListeners();
  };

  public removeRule = (listener: IListenerDescription, index: number): void => {
    listener.rules.splice(index, 1);
    this.updateListeners();
  };

  private handleConditionFieldChanged = (
    condition: IListenerRuleCondition,
    newField: ListenerRuleConditionField,
  ): void => {
    condition.field = newField;
    this.updateListeners();
  };

  private handleRuleChanged = (rule: IListenerRule, key: string, newValue: string): void => {
    rule[key] = newValue;
    this.updateListeners();
  };

  private addCondition = (rule: IListenerRule): void => {
    if (rule.conditions.length === 1) {
      const field = rule.conditions[0].field === 'path-pattern' ? 'host-header' : 'path-pattern';
      rule.conditions.push({ field, values: [''] });
    }
    this.updateListeners();
  };

  private removeCondition = (rule: IListenerRule, index: number): void => {
    rule.conditions.splice(index, 1);
    this.updateListeners();
  };

  private handleRuleActionTargetChanged = (action: IListenerAction, newTarget: string): void => {
    action.targetGroupName = newTarget;
    this.updateListeners();
  };

  private handleRuleActionPortChanged = (action: IListenerAction, newPort: number): void => {
    action.port = newPort;
    this.updateListeners();
  };

  private handleRuleActionTypeChanged = (action: IListenerAction, newType: IListenerActionType): void => {
    action.type = newType;

    if (action.type === 'forward') {
      delete action.redirectActionConfig;
    } else if (action.type === 'redirect') {
      action.redirectActionConfig = {
        statusCode: 'HTTP_301',
      };
      delete action.targetGroupName;
    }

    this.updateListeners();
  };

  private handleSortEnd = (sortEnd: SortEnd, listener: IListenerDescription): void => {
    listener.rules = arrayMove(listener.rules, sortEnd.oldIndex, sortEnd.newIndex);
    this.updateListeners();
  };

  private configureOidcClient = (action: IListenerAction): void => {
    ConfigureOidcConfigModal.show({ config: action.authenticateOidcConfig })
      .then((config: any) => {
        action.authenticateOidcConfig = config;
      })
      .catch(() => {});
  };

  private configureRedirect = (action: IListenerAction): void => {
    ConfigureRedirectConfigModal.show({ config: action.redirectActionConfig })
      .then((config: any) => {
        action.redirectActionConfig = config;
      })
      .catch(() => {});
  };

  private oidcConfigChanged = (action: IListenerAction, config: IAuthenticateOidcActionConfig) => {
    action.authenticateOidcConfig = { ...config };
    this.updateListeners();
  };

  private redirectConfigChanged = (action: IListenerAction, config: IRedirectActionConfig) => {
    action.redirectActionConfig = { ...config };
    this.updateListeners();
  };

  public render() {
    const { errors, values } = this.props.formik;
    const { oidcConfigs } = this.state;

    return (
      <div className="container-fluid form-horizontal">
        <div className="form-group">
          <div className="col-md-12">
            {values.listeners.map((listener, index) => (
              <div key={index} className="wizard-pod">
                <div>
                  <div className="wizard-pod-row header">
                    <div className="wizard-pod-row-title">Listen On</div>
                    <div className="wizard-pod-row-contents spread">
                      <div>
                        <span className="wizard-pod-content">
                          <label>Protocol</label>
                          <select
                            disabled={!listener.isNew}
                            className="form-control input-sm inline-number"
                            style={{ width: '80px' }}
                            value={listener.protocol}
                            onChange={event =>
                              this.listenerProtocolChanged(listener, event.target.value as ALBListenerProtocol)
                            }
                          >
                            {this.protocols.map(p => (
                              <option key={p}>{p}</option>
                            ))}
                          </select>
                        </span>
                        <span className="wizard-pod-content">
                          <label>Port</label>
                          <input
                            disabled={!listener.isNew}
                            className="form-control input-sm inline-number"
                            type="text"
                            min={0}
                            value={listener.port || ''}
                            onChange={event => this.listenerPortChanged(listener, parseInt(event.target.value, 10))}
                            style={{ width: '80px' }}
                            required={true}
                          />
                        </span>
                        <span className="wizard-pod-content">
                          <label>Name</label>
                          <input
                            disabled={!listener.isNew}
                            className="form-control input-sm inline-number"
                            type="text"
                            value={listener.listenerName || ''}
                            onChange={event => this.listenerNameChanged(listener, event.target.value)}
                            style={{ width: '150px' }}
                            required={false}
                          />
                        </span>
                      </div>
                      <div>
                        <a className="sm-label clickable" onClick={() => this.removeListener(index)}>
                          <span className="glyphicon glyphicon-trash" />
                        </a>
                      </div>
                    </div>
                  </div>
                  {this.needsCert(listener) && (
                    <div>
                      <div className="wizard-pod-row">
                        <div className="wizard-pod-row-title">Certificate</div>
                        <div className="wizard-pod-row-contents">
                          <div className="wizard-pod-row-data">
                            <span className="wizard-pod-content">
                              <label>SSL Phrasing</label>
                              <select
                                disabled={!listener.isNew}
                                className="form-control input-sm"
                                value={listener.certificate.sslMode}
                                onChange={event =>
                                  this.certificateTypeChanged(listener.certificate, event.target.value)
                                }
                              >
                                {this.SSLPhrasingOptions.map(t => (
                                  <option key={t.value} value={t.value}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                            </span>
                            <span className="wizard-pod-content">
                              <label>Server Certificate</label>
                              <input
                                disabled={!listener.isNew}
                                className="form-control input-sm no-spel"
                                type="text"
                                value={listener.certificate.certId}
                                onChange={event =>
                                  this.handleCertificateChanged(listener.certificate, {
                                    certId: event.target.value,
                                  })
                                }
                                required={true}
                              />
                            </span>
                            {listener.certificate.sslMode === 'MUTUAL' && (
                              <span className="wizard-pod-content">
                                <label>Client Certificate</label>
                                <input
                                  disabled={!listener.isNew}
                                  className="form-control input-sm no-spel"
                                  type="text"
                                  value={listener.certificate.certCaId}
                                  onChange={event =>
                                    this.handleCertificateChanged(listener.certificate, {
                                      certCaId: event.target.value,
                                    })
                                  }
                                  required={true}
                                />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!this.isL7(listener) && (
                    <HealthCheck
                      isNewListener={listener.isNew}
                      healthCheck={listener.healthCheck}
                      isL7={this.isL7(listener)}
                      handleHealthCheckChanged={this.handleHealthCheckChanged}
                      httpCheckMethods={this.httpCheckMethods}
                      httpCodeOptions={this.httpCodeOptions}
                    />
                  )}
                  <Rules
                    isNewListener={listener.isNew}
                    addCondition={this.addCondition}
                    addRule={this.addRule}
                    distance={10}
                    handleConditionFieldChanged={this.handleConditionFieldChanged}
                    handleRuleChanged={this.handleRuleChanged}
                    handleRuleActionTargetChanged={this.handleRuleActionTargetChanged}
                    handleRuleActionPortChanged={this.handleRuleActionPortChanged}
                    handleRuleActionTypeChanged={this.handleRuleActionTypeChanged}
                    listener={listener}
                    helperClass="rule-sortable-helper"
                    removeRule={this.removeRule}
                    removeCondition={this.removeCondition}
                    targetGroups={values.targetGroups}
                    oidcConfigs={oidcConfigs}
                    oidcConfigChanged={this.oidcConfigChanged}
                    redirectConfigChanged={this.redirectConfigChanged}
                    onSortEnd={sortEnd => this.handleSortEnd(sortEnd, listener)}
                    configureOidcClient={this.configureOidcClient}
                    configureRedirect={this.configureRedirect}
                    isL7={this.isL7(listener)}
                    handleHealthCheckChanged={this.handleHealthCheckChanged}
                    httpCheckMethods={this.httpCheckMethods}
                    httpCodeOptions={this.httpCodeOptions}
                  />
                </div>
              </div>
            ))}
            {errors.listeners && (
              <div className="wizard-pod-row-errors">
                <ValidationMessage type="error" message={errors.listeners} />
              </div>
            )}
            <table className="table table-condensed packed">
              <tbody>
                <tr>
                  <td>
                    <button type="button" className="add-new col-md-12" onClick={this.addListener}>
                      <span>
                        <span className="glyphicon glyphicon-plus-sign" /> Add new listener
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

interface IRuleProps extends IHealthCheckProps {
  rule: IListenerRule;
  listener: IListenerDescription;
  index: number;
  targetGroups: IALBTargetGroupDescription[];
  oidcConfigChanged: (action: IListenerAction, config: IAuthenticateOidcActionConfig) => void;
  redirectConfigChanged: (action: IListenerAction, config: IRedirectActionConfig) => void;
  oidcConfigs: IAuthenticateOidcActionConfig[];
  ruleIndex: number;
  removeRule: (listener: IListenerDescription, index: number) => void;
  handleRuleActionTargetChanged: (action: IListenerAction, newTarget: string) => void;
  handleRuleActionPortChanged: (action: IListenerAction, newPort: number) => void;
  handleRuleActionTypeChanged: (action: IListenerAction, newType: string) => void;
  addCondition: (rule: IListenerRule) => void;
  removeCondition: (rule: IListenerRule, index: number) => void;
  handleConditionFieldChanged: (condition: IListenerRuleCondition, newField: ListenerRuleConditionField) => void;
  handleRuleChanged: (rule: IListenerRule, key: string, newValue: string) => void;
  configureOidcClient: (action: IListenerAction) => void;
  configureRedirect: (action: IListenerAction) => void;
}

const Rule = SortableElement((props: IRuleProps) => (
  <div>
    {props.isL7 && (
      <HealthCheck
        isNewListener={props.isNewListener}
        healthCheck={props.rule.healthCheck}
        isL7={props.isL7}
        handleHealthCheckChanged={props.handleHealthCheckChanged}
        httpCheckMethods={props.httpCheckMethods}
        httpCodeOptions={props.httpCodeOptions}
      />
    )}
    <div className="wizard-pod-row">
      <div className="wizard-pod-row-contents" style={{ padding: '0' }}>
        <table className="table table-condensed packed rules-table">
          <tbody>
            <tr className="listener-rule">
              <td className="handle">
                <DragHandle />
              </td>
              <td colSpan={2}>
                <div className="listener-rule-condition col-md-6">
                  <label>Host</label>
                  {/* <HelpField id="tencent.loadBalancer.ruleCondition.host" /> */}
                  <input
                    disabled={!props.isNewListener}
                    className="form-control input-sm"
                    type="text"
                    value={props.rule.domain}
                    onChange={event => props.handleRuleChanged(props.rule, 'domain', event.target.value)}
                    maxLength={128}
                    required={true}
                    style={{ width: '80%' }}
                  />
                </div>
                <div className="listener-rule-condition col-md-6">
                  <label>Path</label>
                  {/* <HelpField id="tencent.loadBalancer.ruleCondition.path" /> */}
                  <input
                    disabled={!props.isNewListener}
                    className="form-control input-sm"
                    type="text"
                    value={props.rule.url}
                    onChange={event => props.handleRuleChanged(props.rule, 'url', event.target.value)}
                    maxLength={128}
                    required={true}
                    style={{ width: '80%' }}
                  />
                </div>
              </td>
              {props.isNewListener && (
                <td>
                  <RuleActions
                    ruleIndex={props.ruleIndex}
                    listener={props.listener}
                    removeRule={props.removeRule}
                    actions={props.rule.actions}
                  />
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

const RuleActions = (props: {
  ruleIndex?: number;
  actions: IListenerAction[];
  listener: IListenerDescription;
  removeRule?: (listener: IListenerDescription, index: number) => void;
}) => {
  return (
    <span>
      {props.ruleIndex !== undefined && props.ruleIndex >= 0 && props.removeRule && (
        <a
          className="btn btn-sm btn-link clickable"
          onClick={() => props.removeRule(props.listener, props.ruleIndex)}
          style={{ padding: '0' }}
        >
          <Tooltip value="Remove Rule">
            <i className="far fa-fw fa-trash-alt" />
          </Tooltip>
        </a>
      )}
    </span>
  );
};

interface IRulesProps extends IHealthCheckProps {
  addRule: (listener: IListenerDescription) => void;
  removeRule: (listener: IListenerDescription, index: number) => void;
  handleRuleActionTargetChanged: (action: IListenerAction, newTarget: string) => void;
  handleRuleActionPortChanged: (action: IListenerAction, newPort: number) => void;
  handleRuleActionTypeChanged: (action: IListenerAction, type: string) => void;
  addCondition: (rule: IListenerRule) => void;
  removeCondition: (rule: IListenerRule, index: number) => void;
  handleConditionFieldChanged: (condition: IListenerRuleCondition, newField: ListenerRuleConditionField) => void;
  handleRuleChanged: (rule: IListenerRule, key: string, newValue: string) => void;
  listener: IListenerDescription;
  targetGroups: IALBTargetGroupDescription[];
  oidcConfigChanged: (action: IListenerAction, config: IAuthenticateOidcActionConfig) => void;
  redirectConfigChanged: (action: IListenerAction, config: IRedirectActionConfig) => void;
  oidcConfigs: IAuthenticateOidcActionConfig[];
  configureOidcClient: (action: IListenerAction) => void;
  configureRedirect: (action: IListenerAction) => void;
}

const Rules = SortableContainer((props: IRulesProps) => (
  <div>
    {props.listener.rules &&
      props.listener.rules.map((rule, index) => (
        <Rule
          isNewListener={props.isNewListener}
          key={index}
          rule={rule}
          addCondition={props.addCondition}
          handleConditionFieldChanged={props.handleConditionFieldChanged}
          handleRuleChanged={props.handleRuleChanged}
          handleRuleActionTargetChanged={props.handleRuleActionTargetChanged}
          handleRuleActionPortChanged={props.handleRuleActionPortChanged}
          handleRuleActionTypeChanged={props.handleRuleActionTypeChanged}
          oidcConfigChanged={props.oidcConfigChanged}
          redirectConfigChanged={props.redirectConfigChanged}
          removeCondition={props.removeCondition}
          removeRule={props.removeRule}
          targetGroups={props.targetGroups}
          oidcConfigs={props.oidcConfigs}
          listener={props.listener}
          index={index}
          ruleIndex={index}
          configureOidcClient={props.configureOidcClient}
          configureRedirect={props.configureRedirect}
          isL7={props.isL7}
          httpCheckMethods={props.httpCheckMethods}
          httpCodeOptions={props.httpCodeOptions}
          handleHealthCheckChanged={props.handleHealthCheckChanged}
        />
      ))}
    {props.isNewListener && (props.listener.protocol === 'HTTP' || props.listener.protocol === 'HTTPS') && (
      <table className="table table-condensed packed rules-table">
        <tbody>
          <tr className="not-sortable">
            <td colSpan={5}>
              <button type="button" className="add-new col-md-12" onClick={() => props.addRule(props.listener)}>
                <span>
                  <span className="glyphicon glyphicon-plus-sign" /> Add new rule
                </span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    )}
  </div>
));

interface IHealthCheckProps {
  healthCheck?: ITencentHealthCheck;
  isL7: boolean;
  isNewListener: boolean;
  handleHealthCheckChanged: (
    healthCheck: ITencentHealthCheck,
    key: string,
    newValue: string | number | boolean,
  ) => void;
  httpCheckMethods: string[];
  httpCodeOptions: Option[];
}

const HealthCheck = ({
  healthCheck,
  isL7,
  handleHealthCheckChanged,
  httpCheckMethods,
  httpCodeOptions,
  isNewListener,
}: IHealthCheckProps) => {
  return (
    <div>
      <div className="wizard-pod-row">
        <div className="wizard-pod-row-title">
          <span>Health Check &nbsp;</span>
        </div>
        <div className="wizard-pod-row-contents">
          <div className="wizard-pod-row-data">
            <span className="wizard-pod-content">
              <select
                disabled={!isNewListener}
                className="form-control input-sm"
                value={healthCheck.healthSwitch}
                onChange={event =>
                  handleHealthCheckChanged(healthCheck, 'healthSwitch', parseInt(event.target.value, 10))
                }
              >
                <option value={1}>enable</option>
                <option value={0}>disable</option>
              </select>
            </span>
            {!!healthCheck.healthSwitch && !healthCheck.showAdvancedSetting && (
              <span className="wizard-pod-content">
                <a
                  onClick={() => handleHealthCheckChanged(healthCheck, 'showAdvancedSetting', true)}
                  className="clickable"
                >
                  Configure advanced settings
                </a>
              </span>
            )}
            {!!healthCheck.healthSwitch && healthCheck.showAdvancedSetting && (
              <span className="wizard-pod-content">
                <label>Timeout </label>
                <input
                  disabled={!isNewListener}
                  className="form-control input-sm inline-number"
                  type="number"
                  min={2}
                  max={60}
                  value={healthCheck.timeOut || ''}
                  onChange={event => handleHealthCheckChanged(healthCheck, 'timeOut', parseInt(event.target.value, 10))}
                  required={true}
                />
              </span>
            )}
            {!!healthCheck.healthSwitch && healthCheck.showAdvancedSetting && (
              <span className="wizard-pod-content">
                <label>Interval </label>
                <input
                  disabled={!isNewListener}
                  className="form-control input-sm inline-number"
                  type="number"
                  min={5}
                  max={300}
                  value={healthCheck.intervalTime || ''}
                  onChange={event =>
                    handleHealthCheckChanged(healthCheck, 'intervalTime', parseInt(event.target.value, 10))
                  }
                  required={true}
                />
              </span>
            )}
          </div>
        </div>
      </div>
      {!!healthCheck.healthSwitch && healthCheck.showAdvancedSetting && (
        <div className="wizard-pod-row">
          <div className="wizard-pod-row-title">Healthcheck Threshold</div>
          <div className="wizard-pod-row-contents">
            <div className="wizard-pod-row-data">
              <span className="wizard-pod-content">
                <label>Healthy </label>
                <input
                  disabled={!isNewListener}
                  className="form-control input-sm inline-number"
                  type="number"
                  min={2}
                  max={10}
                  value={healthCheck.healthNum || ''}
                  onChange={event =>
                    handleHealthCheckChanged(healthCheck, 'healthNum', parseInt(event.target.value, 10))
                  }
                  required={true}
                />
              </span>
              <span className="wizard-pod-content">
                <label>Unhealthy </label>
                <input
                  disabled={!isNewListener}
                  className="form-control input-sm inline-number"
                  type="number"
                  min={2}
                  max={10}
                  value={healthCheck.unHealthNum || ''}
                  onChange={event =>
                    handleHealthCheckChanged(healthCheck, 'unHealthNum', parseInt(event.target.value, 10))
                  }
                  required={true}
                />
              </span>
            </div>
          </div>
        </div>
      )}
      {!!healthCheck.healthSwitch && healthCheck.showAdvancedSetting && isL7 && (
        <div>
          <div className="wizard-pod-row">
            <div className="wizard-pod-row-title">HTTP Check Domain</div>
            <div className="wizard-pod-row-contents">
              <div className="wizard-pod-row-data">
                <span className="wizard-pod-content">
                  <SpInput
                    disabled={!isNewListener}
                    className="form-control input-sm inline-text"
                    style={{ width: '130px' }}
                    name="httpCheckDomain"
                    value={healthCheck.httpCheckDomain}
                    onChange={event => handleHealthCheckChanged(healthCheck, 'httpCheckDomain', event.target.value)}
                  />
                </span>
              </div>
            </div>
          </div>
          <div className="wizard-pod-row">
            <div className="wizard-pod-row-title">HTTP Check Directories</div>
            <div className="wizard-pod-row-contents">
              <div className="wizard-pod-row-data">
                <span className="wizard-pod-content">
                  <SpInput
                    disabled={!isNewListener}
                    className="form-control input-sm inline-text"
                    style={{ width: '130px' }}
                    name="httpCheckPath"
                    required={true}
                    value={healthCheck.httpCheckPath}
                    onChange={event => handleHealthCheckChanged(healthCheck, 'httpCheckPath', event.target.value)}
                  />
                </span>
              </div>
            </div>
          </div>
          <div className="wizard-pod-row">
            <div className="wizard-pod-row-title">HTTP Request Method</div>
            <div className="wizard-pod-row-contents">
              <div className="wizard-pod-row-data">
                <span className="wizard-pod-content">
                  <select
                    disabled={!isNewListener}
                    className="form-control input-sm inline-number"
                    value={healthCheck.httpCheckMethod}
                    onChange={event => handleHealthCheckChanged(healthCheck, 'httpCheckMethod', event.target.value)}
                  >
                    {httpCheckMethods.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </span>
              </div>
            </div>
          </div>
          <div className="wizard-pod-row">
            <div className="wizard-pod-row-title">HTTP Status Code Detection</div>
            <div className="wizard-pod-row-contents">
              <div className="wizard-pod-row-data">
                <span className="wizard-pod-content">
                  <VirtualizedSelect
                    disabled={!isNewListener}
                    style={{ width: '320px' }}
                    ignoreAccents={true}
                    options={httpCodeOptions.map(({ label, value }) => ({ label, value }))}
                    onChange={(options: IOption[]) => {
                      handleHealthCheckChanged(
                        healthCheck,
                        'httpCode',
                        options.map(({ value }) => value as number).reduce((acc, cur) => acc + cur, 0),
                      );
                    }}
                    value={healthCheck.httpCode
                      .toString(2)
                      .split('')
                      .reverse()
                      .map((v, i) => v === '1' && Math.pow(2, i))
                      .filter(v => !!v)}
                    multi={true}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
