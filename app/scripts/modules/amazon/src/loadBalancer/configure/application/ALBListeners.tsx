import * as React from 'react';
import Select, { Option } from 'react-select';
import { SortableContainer, SortableElement, SortableHandle, arrayMove, SortEnd } from 'react-sortable-hoc';
import { difference, flatten, get, uniq } from 'lodash';
import { FormikErrors, FormikProps } from 'formik';

import { Application, HelpField, IWizardPageProps, Tooltip, ValidationMessage, wizardPage } from '@spinnaker/core';

import { AWSProviderSettings } from 'amazon/aws.settings';
import {
  ALBListenerProtocol,
  IALBListenerCertificate,
  IALBListenerDescription,
  IALBTargetGroupDescription,
  IAmazonApplicationLoadBalancerUpsertCommand,
  IListenerAction,
  IListenerRule,
  IListenerRuleCondition,
  ListenerRuleConditionField,
} from 'amazon/domain';
import { AmazonCertificateReader, IAmazonCertificate } from 'amazon/certificates/AmazonCertificateReader';
import { IAuthenticateOidcActionConfig, OidcConfigReader } from 'amazon/loadBalancer/OidcConfigReader';

import { ConfigureOidcConfigModal } from './ConfigureOidcConfigModal';

export interface IALBListenersState {
  certificates: { [accountId: number]: IAmazonCertificate[] };
  certificateTypes: string[];
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

const defaultAuthAction = {
  authenticateOidcConfig: {
    authorizationEndpoint: '',
    clientId: '',
    issuer: '',
    scope: 'openid',
    sessionCookieName: 'AWSELBAuthSessionCookie',
    tokenEndpoint: '',
    userInfoEndpoint: '',
  },
  type: 'authenticate-oidc',
} as IListenerAction;

export interface IALBListenersProps {
  app: Application;
}

class ALBListenersImpl extends React.Component<
  IALBListenersProps & IWizardPageProps & FormikProps<IAmazonApplicationLoadBalancerUpsertCommand>,
  IALBListenersState
> {
  public static LABEL = 'Listeners';
  public protocols = ['HTTP', 'HTTPS'];

  private removedAuthActions: { [key: number]: IListenerAction } = {};

  constructor(props: IALBListenersProps & IWizardPageProps & FormikProps<IAmazonApplicationLoadBalancerUpsertCommand>) {
    super(props);
    this.state = {
      certificates: [],
      certificateTypes: get(AWSProviderSettings, 'loadBalancers.certificateTypes', ['iam', 'acm']),
      oidcConfigs: undefined,
    };
  }

  private getAllTargetGroupsFromListeners(listeners: IALBListenerDescription[]): string[] {
    const actions = flatten(listeners.map(l => l.defaultActions));
    const rules = flatten(listeners.map(l => l.rules));
    actions.push(...flatten(rules.map(r => r.actions)));
    return uniq(actions.map(a => a.targetGroupName));
  }

  public validate(
    values: IAmazonApplicationLoadBalancerUpsertCommand,
  ): FormikErrors<IAmazonApplicationLoadBalancerUpsertCommand> {
    const errors = {} as FormikErrors<IAmazonApplicationLoadBalancerUpsertCommand>;

    // Check to make sure all target groups have an associated listener
    const targetGroupNames = values.targetGroups.map(tg => tg.name);
    const usedTargetGroupNames = this.getAllTargetGroupsFromListeners(values.listeners);
    const unusedTargetGroupNames = difference(targetGroupNames, usedTargetGroupNames);
    if (unusedTargetGroupNames.length === 1) {
      errors.listeners = `Target group ${unusedTargetGroupNames[0]} is unused.`;
    } else if (unusedTargetGroupNames.length > 1) {
      errors.listeners = `Target groups ${unusedTargetGroupNames.join(', ')} are unused.`;
    }

    const missingRuleFields = values.listeners.find(l => {
      const defaultActionsHaveMissingTarget = !!l.defaultActions.find(
        da =>
          (da.type === 'forward' && !da.targetGroupName) ||
          (da.type === 'authenticate-oidc' && !da.authenticateOidcConfig.clientId),
      );
      const rulesHaveMissingFields = !!l.rules.find(rule => {
        const missingTargets = !!rule.actions.find(a => a.type === 'forward' && !a.targetGroupName);
        const missingAuth = !!rule.actions.find(
          a => a.type === 'authenticate-oidc' && !a.authenticateOidcConfig.clientId,
        );
        const missingValue = !!rule.conditions.find(c => c.values.includes(''));
        return missingTargets || missingAuth || missingValue;
      });
      return defaultActionsHaveMissingTarget || rulesHaveMissingFields;
    });

    if (missingRuleFields) {
      errors.listeners = `Missing fields in rule configuration.`;
    }

    return errors;
  }

  public componentDidMount(): void {
    this.loadCertificates();
    this.loadOidcClients();
  }

  private loadCertificates(): void {
    AmazonCertificateReader.listCertificates().then(certificates => {
      this.setState({ certificates });
    });
  }

  private loadOidcClients(): void {
    OidcConfigReader.getOidcConfigsByApp(this.props.app.name)
      .then(oidcConfigs => this.setState({ oidcConfigs }))
      .catch(() => {});
  }

  private updateListeners(): void {
    this.props.setFieldValue('listeners', this.props.values.listeners);
  }

  private needsCert(listener: IALBListenerDescription): boolean {
    return listener.protocol === 'HTTPS';
  }

  private showCertificateSelect(certificate: IALBListenerCertificate): boolean {
    return certificate.type === 'iam' && this.state.certificates && Object.keys(this.state.certificates).length > 0;
  }

  private addListenerCertificate(listener: IALBListenerDescription): void {
    listener.certificates = listener.certificates || [];
    listener.certificates.push({
      certificateArn: undefined,
      type: 'iam',
      name: undefined,
    });
  }

  private removeAuthActions(listener: IALBListenerDescription): void {
    const authIndex = listener.defaultActions.findIndex(a => a.type === 'authenticate-oidc');
    if (authIndex !== -1) {
      this.removeAuthAction(listener.defaultActions, authIndex, -1);
    }
    listener.rules.forEach((rule, ruleIndex) => {
      const index = rule.actions.findIndex(a => a.type === 'authenticate-oidc');
      if (index !== -1) {
        this.removeAuthAction(rule.actions, index, ruleIndex);
      }
    });
    this.updateListeners();
  }

  private reenableAuthActions(listener: IALBListenerDescription): void {
    const existingDefaultAuthAction = this.removedAuthActions[-1];
    this.removedAuthActions[-1] = undefined;
    if (existingDefaultAuthAction) {
      listener.defaultActions.unshift({ ...existingDefaultAuthAction });
    }
    listener.rules.forEach((rule, ruleIndex) => {
      const existingAuthAction = this.removedAuthActions[ruleIndex];
      this.removedAuthActions[ruleIndex] = undefined;
      if (existingAuthAction) {
        rule.actions.unshift({ ...existingAuthAction });
      }
    });
  }

  private listenerProtocolChanged(listener: IALBListenerDescription, newProtocol: ALBListenerProtocol): void {
    listener.protocol = newProtocol;
    if (listener.protocol === 'HTTPS') {
      listener.port = 443;
      if (!listener.certificates || listener.certificates.length === 0) {
        this.addListenerCertificate(listener);
      }
      this.reenableAuthActions(listener);
    }
    if (listener.protocol === 'HTTP') {
      listener.port = 80;
      listener.certificates.length = 0;
      this.removeAuthActions(listener);
    }
    this.updateListeners();
  }

  private listenerPortChanged(listener: IALBListenerDescription, newPort: string): void {
    listener.port = Number.parseInt(newPort, 10);
    this.updateListeners();
  }

  private certificateTypeChanged(certificate: IALBListenerCertificate, newType: string): void {
    certificate.type = newType;
    this.updateListeners();
  }

  private handleCertificateChanged(certificate: IALBListenerCertificate, newCertificateName: string): void {
    certificate.name = newCertificateName;
    this.updateListeners();
  }

  private removeListener(index: number): void {
    this.props.values.listeners.splice(index, 1);
    this.updateListeners();
  }

  private addListener = (): void => {
    this.props.values.listeners.push({
      certificates: [],
      protocol: 'HTTP',
      port: 80,
      defaultActions: [
        {
          type: 'forward',
          targetGroupName: '',
        },
      ],
      rules: [],
    });
    this.updateListeners();
  };

  private addRule = (listener: IALBListenerDescription): void => {
    const newRule: IListenerRule = {
      priority: null,
      actions: [
        {
          type: 'forward',
          targetGroupName: '',
        },
      ],
      conditions: [
        {
          field: 'path-pattern',
          values: [''],
        },
      ],
    };

    listener.rules.push(newRule);
    this.updateListeners();
  };

  public removeRule = (listener: IALBListenerDescription, index: number): void => {
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

  private handleConditionValueChanged = (condition: IListenerRuleCondition, newValue: string): void => {
    condition.values[0] = newValue;
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

  private handleSortEnd = (sortEnd: SortEnd, listener: IALBListenerDescription): void => {
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

  private removeAuthAction(actions: IListenerAction[], authIndex: number, ruleIndex: number): void {
    const removedAuthAction = actions.splice(authIndex, 1)[0];
    this.removedAuthActions[ruleIndex || -1] = removedAuthAction;
  }

  private authenticateRuleToggle = (listener: IALBListenerDescription, ruleIndex: number) => {
    const rules = listener.rules[ruleIndex];
    const actions = (rules && rules.actions) || listener.defaultActions;
    if (actions) {
      const authIndex = actions.findIndex(a => a.type === 'authenticate-oidc');
      if (authIndex !== -1) {
        this.removeAuthAction(actions, authIndex, ruleIndex);
      } else {
        const newAuthAction = this.removedAuthActions[ruleIndex || -1] || { ...defaultAuthAction };
        actions.unshift({ ...newAuthAction });
      }
      this.updateListeners();
    }
  };

  private oidcConfigChanged = (action: IListenerAction, config: IAuthenticateOidcActionConfig) => {
    action.authenticateOidcConfig = { ...config };
    this.updateListeners();
  };

  public render() {
    const { errors, values } = this.props;
    const { certificates, certificateTypes, oidcConfigs } = this.state;

    const certificatesForAccount = certificates[values.credentials as any] || [];
    const certificateOptions = certificatesForAccount.map(cert => {
      return { label: cert.serverCertificateName, value: cert.serverCertificateName };
    });

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
                            className="form-control input-sm inline-number"
                            style={{ width: '80px' }}
                            value={listener.protocol}
                            onChange={event =>
                              this.listenerProtocolChanged(listener, event.target.value as ALBListenerProtocol)
                            }
                          >
                            {this.protocols.map(p => <option key={p}>{p}</option>)}
                          </select>
                        </span>
                        <span className="wizard-pod-content">
                          <label>Port</label>
                          <input
                            className="form-control input-sm inline-number"
                            type="text"
                            min={0}
                            value={listener.port || ''}
                            onChange={event => this.listenerPortChanged(listener, event.target.value)}
                            style={{ width: '80px' }}
                            required={true}
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
                    <div className="wizard-pod-row">
                      <div className="wizard-pod-row-title">Certificate</div>
                      <div className="wizard-pod-row-contents">
                        {listener.certificates.map((certificate, cIndex) => (
                          <div key={cIndex} style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                            <select
                              className="form-control input-sm inline-number"
                              style={{ width: '45px' }}
                              value={certificate.type}
                              onChange={event => this.certificateTypeChanged(certificate, event.target.value)}
                            >
                              {certificateTypes.map(t => <option key={t}>{t}</option>)}
                            </select>
                            {this.showCertificateSelect(certificate) && (
                              <Select
                                wrapperStyle={{ width: '100%' }}
                                clearable={false}
                                required={true}
                                options={certificateOptions}
                                onChange={(value: Option<string>) =>
                                  this.handleCertificateChanged(certificate, value.value)
                                }
                                value={certificate.name}
                              />
                            )}
                            {!this.showCertificateSelect(certificate) && (
                              <input
                                className="form-control input-sm no-spel"
                                style={{ display: 'inline-block' }}
                                type="text"
                                value={certificate.name}
                                onChange={event => this.handleCertificateChanged(certificate, event.target.value)}
                                required={true}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="wizard-pod-row">
                    <div className="wizard-pod-row-contents" style={{ padding: '0' }}>
                      <table className="table table-condensed packed rules-table">
                        <thead>
                          <tr>
                            <th style={{ width: '15px', padding: '0' }} />
                            <th>If</th>
                            <th style={{ width: '315px' }}>Then</th>
                            <th style={{ width: '45px' }} />
                          </tr>
                        </thead>
                        <Rules
                          addCondition={this.addCondition}
                          addRule={this.addRule}
                          authenticateRuleToggle={this.authenticateRuleToggle}
                          distance={10}
                          handleConditionFieldChanged={this.handleConditionFieldChanged}
                          handleConditionValueChanged={this.handleConditionValueChanged}
                          handleRuleActionTargetChanged={this.handleRuleActionTargetChanged}
                          listener={listener}
                          helperClass="rule-sortable-helper"
                          removeRule={this.removeRule}
                          removeCondition={this.removeCondition}
                          targetGroups={values.targetGroups}
                          oidcConfigs={oidcConfigs}
                          oidcConfigChanged={this.oidcConfigChanged}
                          onSortEnd={sortEnd => this.handleSortEnd(sortEnd, listener)}
                          configureOidcClient={this.configureOidcClient}
                        />
                      </table>
                    </div>
                  </div>
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

interface IRuleProps {
  rule: IListenerRule;
  listener: IALBListenerDescription;
  index: number;
  targetGroups: IALBTargetGroupDescription[];
  oidcConfigChanged: (action: IListenerAction, config: IAuthenticateOidcActionConfig) => void;
  oidcConfigs: IAuthenticateOidcActionConfig[];
  ruleIndex: number;
  authenticateRuleToggle: (listener: IALBListenerDescription, index: number) => void;
  removeRule: (listener: IALBListenerDescription, index: number) => void;
  handleRuleActionTargetChanged: (action: IListenerAction, newTarget: string) => void;
  addCondition: (rule: IListenerRule) => void;
  removeCondition: (rule: IListenerRule, index: number) => void;
  handleConditionFieldChanged: (condition: IListenerRuleCondition, newField: ListenerRuleConditionField) => void;
  handleConditionValueChanged: (condition: IListenerRuleCondition, newValue: string) => void;
  configureOidcClient: (action: IListenerAction) => void;
}

const Rule = SortableElement((props: IRuleProps) => (
  <tr className="listener-rule">
    <td className="handle">
      <DragHandle />
    </td>
    <td>
      {props.rule.conditions.map((condition, cIndex) => (
        <div key={cIndex} className="listener-rule-condition">
          <select
            className="form-control input-sm inline-number"
            value={condition.field}
            onChange={event =>
              props.handleConditionFieldChanged(condition, event.target.value as ListenerRuleConditionField)
            }
            style={{ width: '60px' }}
            required={true}
          >
            {(props.rule.conditions.length === 1 || condition.field === 'host-header') && (
              <option label="Host" value="host-header" />
            )}
            {(props.rule.conditions.length === 1 || condition.field === 'path-pattern') && (
              <option label="Path" value="path-pattern" />
            )}
          </select>
          {condition.field === 'path-pattern' && <HelpField id="aws.loadBalancer.ruleCondition.path" />}
          {condition.field === 'host-header' && <HelpField id="aws.loadBalancer.ruleCondition.host" />}
          <input
            className="form-control input-sm"
            type="text"
            value={condition.values[0]}
            onChange={event => props.handleConditionValueChanged(condition, event.target.value)}
            maxLength={128}
            required={true}
          />
          <span className="remove-condition">
            {cIndex === 1 && (
              <a
                className="btn btn-sm btn-link clickable"
                onClick={() => props.removeCondition(props.rule, cIndex)}
                style={{ padding: '0' }}
              >
                <Tooltip value="Remove Condition">
                  <span className="glyphicon glyphicon-trash" />
                </Tooltip>
              </a>
            )}
          </span>
        </div>
      ))}
      {props.rule.conditions.length === 1 && (
        <div className="add-new-container">
          <button type="button" className="add-new col-md-12" onClick={() => props.addCondition(props.rule)}>
            <span>
              <span className="glyphicon glyphicon-plus-sign" /> Add new condition
            </span>
          </button>
          <span style={{ minWidth: '15px' }} />
        </div>
      )}
    </td>
    <td>
      {props.rule.actions.map((action, index) => (
        <Action
          key={index}
          action={action}
          oidcConfigChanged={config => props.oidcConfigChanged(action, config)}
          targetChanged={target => props.handleRuleActionTargetChanged(action, target)}
          targetGroups={props.targetGroups}
          oidcConfigs={props.oidcConfigs}
          configureOidcClient={props.configureOidcClient}
        />
      ))}
    </td>
    <td>
      <RuleActions
        ruleIndex={props.ruleIndex}
        listener={props.listener}
        authenticateRuleToggle={props.authenticateRuleToggle}
        removeRule={props.removeRule}
        actions={props.rule.actions}
      />
    </td>
  </tr>
));

const Action = (props: {
  action: IListenerAction;
  oidcConfigChanged: (config: IAuthenticateOidcActionConfig) => void;
  targetChanged: (newTarget: string) => void;
  targetGroups: IALBTargetGroupDescription[];
  oidcConfigs: IAuthenticateOidcActionConfig[];
  configureOidcClient: (action: IListenerAction) => void;
}) => {
  if (props.action.type === 'forward') {
    return (
      <div className="horizontal middle" style={{ height: '30px' }}>
        <span style={{ whiteSpace: 'pre' }}>forward to </span>
        <select
          className="form-control input-sm"
          value={props.action.targetGroupName}
          onChange={event => props.targetChanged(event.target.value)}
          required={true}
        >
          <option value="" />
          {uniq(props.targetGroups.map(tg => tg.name)).map(name => <option key={name}>{name}</option>)}
        </select>
      </div>
    );
  }
  if (props.action.type === 'authenticate-oidc') {
    const clientId = props.action.authenticateOidcConfig.clientId;

    const showOidcConfigs =
      props.oidcConfigs &&
      props.oidcConfigs.length > 0 &&
      (!clientId || props.oidcConfigs.find(c => c.clientId === clientId));
    return (
      <div className="horizontal middle" style={{ height: '30px' }}>
        <span style={{ whiteSpace: 'pre' }}>auth with OIDC client </span>

        {showOidcConfigs && (
          <select
            className="form-control input-sm"
            value={clientId}
            onChange={event => props.oidcConfigChanged(props.oidcConfigs.find(c => c.clientId === event.target.value))}
            required={true}
          >
            <option value="" />
            {(props.oidcConfigs || []).map(config => <option key={config.clientId}>{config.clientId}</option>)}
          </select>
        )}
        {!showOidcConfigs && (
          // a link text to open an oidc modal that is labeled with the client_id
          <a onClick={() => props.configureOidcClient(props.action)} className="clickable">
            {clientId || 'Configure...'}
          </a>
        )}
        <span style={{ whiteSpace: 'pre' }}>
          <em> and then</em>
        </span>
      </div>
    );
  }

  return null;
};

const RuleActions = (props: {
  ruleIndex?: number;
  actions: IListenerAction[];
  listener: IALBListenerDescription;
  authenticateRuleToggle: (listener: IALBListenerDescription, index: number) => void;
  removeRule?: (listener: IALBListenerDescription, index: number) => void;
}) => {
  const hasAuth = Boolean(props.actions.find(a => a.type === 'authenticate-oidc'));
  const allowAuth = props.listener.protocol === 'HTTPS';
  const tooltip = hasAuth ? 'Remove authentication from rule' : 'Authenticate rule';
  const icon = hasAuth ? 'fas fa-fw fa-lock-open' : 'fas fa-fw fa-user-lock';
  return (
    <span>
      {allowAuth && (
        <a
          className="btn btn-sm btn-link clickable"
          onClick={() => props.authenticateRuleToggle(props.listener, props.ruleIndex)}
          style={{ padding: '0' }}
        >
          <Tooltip value={tooltip}>
            <i className={icon} />
          </Tooltip>
        </a>
      )}
      {props.ruleIndex !== undefined &&
        props.ruleIndex >= 0 &&
        props.removeRule && (
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

interface IRulesProps {
  addRule: (listener: IALBListenerDescription) => void;
  authenticateRuleToggle: (listener: IALBListenerDescription, index: number) => void;
  removeRule: (listener: IALBListenerDescription, index: number) => void;
  handleRuleActionTargetChanged: (action: IListenerAction, newTarget: string) => void;
  addCondition: (rule: IListenerRule) => void;
  removeCondition: (rule: IListenerRule, index: number) => void;
  handleConditionFieldChanged: (condition: IListenerRuleCondition, newField: ListenerRuleConditionField) => void;
  handleConditionValueChanged: (condition: IListenerRuleCondition, newValue: string) => void;
  listener: IALBListenerDescription;
  targetGroups: IALBTargetGroupDescription[];
  oidcConfigChanged: (action: IListenerAction, config: IAuthenticateOidcActionConfig) => void;
  oidcConfigs: IAuthenticateOidcActionConfig[];
  configureOidcClient: (action: IListenerAction) => void;
}

const Rules = SortableContainer((props: IRulesProps) => (
  <tbody>
    <tr className="not-sortable">
      <td />
      <td>Default</td>
      <td>
        {props.listener.defaultActions.map((action, index) => (
          <Action
            key={index}
            action={action}
            targetChanged={target => props.handleRuleActionTargetChanged(action, target)}
            targetGroups={props.targetGroups}
            oidcConfigs={props.oidcConfigs}
            oidcConfigChanged={config => props.oidcConfigChanged(action, config)}
            configureOidcClient={props.configureOidcClient}
          />
        ))}
      </td>
      <td>
        <RuleActions
          listener={props.listener}
          actions={props.listener.defaultActions}
          authenticateRuleToggle={props.authenticateRuleToggle}
        />
      </td>
    </tr>
    {props.listener.rules.map((rule, index) => (
      <Rule
        key={index}
        rule={rule}
        addCondition={props.addCondition}
        handleConditionFieldChanged={props.handleConditionFieldChanged}
        handleConditionValueChanged={props.handleConditionValueChanged}
        handleRuleActionTargetChanged={props.handleRuleActionTargetChanged}
        oidcConfigChanged={props.oidcConfigChanged}
        removeCondition={props.removeCondition}
        authenticateRuleToggle={props.authenticateRuleToggle}
        removeRule={props.removeRule}
        targetGroups={props.targetGroups}
        oidcConfigs={props.oidcConfigs}
        listener={props.listener}
        index={index}
        ruleIndex={index}
        configureOidcClient={props.configureOidcClient}
      />
    ))}
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
));

export const ALBListeners = wizardPage<IALBListenersProps>(ALBListenersImpl);
