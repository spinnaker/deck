import * as React from 'react';
import { Table, Button } from 'react-bootstrap';
import { SelectInput, FirewallLabels, Application } from '@spinnaker/core';
import { FormikProps } from 'formik';
import { ISecurityGroupIngress, ISecurityGroupDetail } from '../../define';

interface IIngressProps {
  formik: FormikProps<ISecurityGroupDetail>;
  app: Application;
  inRules?: ISecurityGroupIngress[];
}
interface IIngressState {
  inRules: ISecurityGroupIngress[];
}

export class Ingress extends React.Component<IIngressProps, IIngressState> {
  constructor(props: IIngressProps) {
    super(props);
    this.state = {
      inRules: this.props.inRules,
    };
  }
  handleAdd(ruleset: ISecurityGroupIngress[]) {
    ruleset.push({
      cidrBlock: '',
      action: 'ACCEPT',
      protocol: 'TCP',
      port: 7001,
    });
    this.props.formik.setFieldValue('inRules', ruleset);
    this.setState({
      inRules: ruleset,
    });
  }

  handleRemove(ruleset: ISecurityGroupIngress[], index: number) {
    ruleset.splice(index, 1);
    this.props.formik.setFieldValue('inRules', ruleset);
  }

  private cidrBlockUpdated = (
    event: React.ChangeEvent<HTMLInputElement>,
    ruleset: ISecurityGroupIngress[],
    index: number,
  ): void => {
    ruleset[index].cidrBlock = event.target.value;
    this.props.formik.setFieldValue('inRules', ruleset);
    this.setState({
      inRules: ruleset,
    });
  };
  private protocolUpdated = (protocol: string, ruleset: ISecurityGroupIngress[], index: number): void => {
    ruleset[index].protocol = protocol;
    this.props.formik.setFieldValue('inRules', ruleset);
    this.setState({
      inRules: ruleset,
    });
  };
  private portUpdated = (
    event: React.ChangeEvent<HTMLInputElement>,
    ruleset: ISecurityGroupIngress[],
    index: number,
  ): void => {
    ruleset[index].port = event.target.value;
    this.props.formik.setFieldValue('inRules', ruleset);
    this.setState({
      inRules: ruleset,
    });
  };
  private actionUpdated = (action: string, ruleset: ISecurityGroupIngress[], index: number): void => {
    ruleset[index].action = action;
    this.props.formik.setFieldValue('inRules', ruleset);
    this.setState({
      inRules: ruleset,
    });
  };

  public render() {
    const { inRules = [] } = this.state;
    return (
      <div>
        <p className="info">
          <span className="glyphicon glyphicon-info-sign"></span> IP range rules can only be edited through the
          tencentcloud cloud Console.
        </p>
        <Table striped hover>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Cidr Block</th>
              <th style={{ width: '15%' }}>Protocol</th>
              <th style={{ width: '15%' }}>Port</th>
              <th style={{ width: '15%' }}>Policy</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {inRules.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    required={true}
                    className={`form-control input-sm no-spel`}
                    name="cidrBlock"
                    value={item.cidrBlock}
                    onChange={e => this.cidrBlockUpdated(e, inRules, index)}
                  />
                </td>
                <td>
                  <SelectInput
                    required={true}
                    inputClassName="form-control input-sm"
                    options={[
                      { label: 'TCP', value: 'TCP' },
                      { label: 'UDP', value: 'UDP' },
                      { label: 'ICMP', value: 'ICMP' },
                    ]}
                    value={item.protocol}
                    onChange={e => this.protocolUpdated(e.target.value, inRules, index)}
                  />
                </td>
                <td>
                  <input
                    required={item.protocol !== 'ICMP'}
                    disabled={item.protocol === 'ICMP'}
                    className={`form-control input-sm no-spel`}
                    name="port"
                    value={item.port}
                    onChange={e => this.portUpdated(e, inRules, index)}
                  />
                </td>
                <td>
                  <SelectInput
                    required={true}
                    inputClassName="form-control input-sm"
                    options={[
                      { label: 'ACCEPT', value: 'ACCEPT' },
                      { label: 'DROP', value: 'DROP' },
                    ]}
                    value={item.action}
                    onChange={e => this.actionUpdated(e.target.value, inRules, index)}
                  />
                </td>
                <td>
                  <a className="sm-label" onClick={() => this.handleRemove(inRules, index)}>
                    <span className="glyphicon glyphicon-trash"></span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}>
                <Button block className="btn-block add-new" onClick={() => this.handleAdd(inRules)}>
                  <span className="glyphicon glyphicon-plus-sign" />
                  {FirewallLabels.get('Firewall')} Add New
                </Button>
              </td>
            </tr>
          </tfoot>
        </Table>
      </div>
    );
  }
}
