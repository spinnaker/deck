import * as React from 'react';
import { Table, Button } from 'react-bootstrap';
import { FirewallLabels, FormikFormField, TextInput, FormValidator, SelectInput } from '@spinnaker/core';
import { FieldArray, FormikProps } from 'formik';
import { ISecurityGroupDetail } from '../../interface';

interface IIngressProps {
  formik: FormikProps<ISecurityGroupDetail>;
}

export class SecurityGroupIngress extends React.Component<IIngressProps> {
  constructor(props: IIngressProps) {
    super(props);
  }

  public validate(values: ISecurityGroupDetail) {
    const formValidator = new FormValidator(values);
    formValidator.field('inRules').withValidators(
      formValidator.arrayForEach(inRule => {
        inRule.field('cidrBlock', 'CidrBlock').required();
        inRule.field('action', 'Action').required();
        inRule.field('protocol', 'Protocol').required();
      }),
    );
    return formValidator.validateForm();
  }

  public render() {
    const { inRules = [] } = this.props.formik.values;
    return (
      <div>
        <p className="info">
          <span className="glyphicon glyphicon-info-sign"></span> IP range rules can only be edited through the
          tencentcloud cloud Console.
        </p>
        <FieldArray
          name="inRules"
          render={arrayHelpers => (
            <Table striped hover>
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Cidr Block</th>
                  <th style={{ width: '15%' }}>Protocol</th>
                  <th style={{ width: '15%' }}>Port</th>
                  <th style={{ width: '15%' }}>Policy</th>
                  <th style={{ width: '15%' }}>Operation</th>
                </tr>
              </thead>
              <tbody>
                {inRules.map((_item, index) => (
                  <tr key={index}>
                    <td>
                      <FormikFormField
                        name={`inRules.${index}.cidrBlock`}
                        input={props => <TextInput required={true} {...props} />}
                      />
                    </td>
                    <td>
                      <FormikFormField
                        name={`inRules.${index}.protocol`}
                        input={props => (
                          <SelectInput
                            {...props}
                            options={[
                              { label: 'TCP', value: 'TCP' },
                              { label: 'UDP', value: 'UDP' },
                              { label: 'ICMP', value: 'ICMP' },
                            ]}
                          />
                        )}
                      />
                    </td>
                    <td>
                      <FormikFormField
                        name={`inRules.${index}.port`}
                        input={props => <TextInput {...props} disabled={_item.protocol === 'ICMP'} />}
                      />
                    </td>
                    <td>
                      <FormikFormField
                        name={`inRules.${index}.action`}
                        input={props => (
                          <SelectInput
                            {...props}
                            options={[
                              { label: 'ACCEPT', value: 'ACCEPT' },
                              { label: 'DROP', value: 'DROP' },
                            ]}
                          />
                        )}
                      />
                    </td>
                    <td>
                      <a className="sm-label" onClick={() => arrayHelpers.remove(index)}>
                        <span className="glyphicon glyphicon-trash"></span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5}>
                    <Button
                      block
                      className="btn-block add-new"
                      onClick={() =>
                        arrayHelpers.push({
                          cidrBlock: '',
                          action: 'ACCEPT',
                          protocol: 'TCP',
                          port: 7001,
                        })
                      }
                    >
                      <span className="glyphicon glyphicon-plus-sign" />
                      {FirewallLabels.get('Firewall')} Add New
                    </Button>
                  </td>
                </tr>
              </tfoot>
            </Table>
          )}
        />
      </div>
    );
  }
}
