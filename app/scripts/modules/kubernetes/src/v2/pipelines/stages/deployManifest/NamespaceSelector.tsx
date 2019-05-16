import * as React from 'react';
import Select, { Creatable, Option } from 'react-select';
import { get, find, map, includes } from 'lodash';
import { IAccountDetails } from '@spinnaker/core';

export interface INamespaceSelectorProps {
  onChange: (namespace: string) => void;
  accounts: IAccountDetails[];
  selectedAccount: string;
  selectedNamespace: string;
  createable?: boolean;
}

export class NamespaceSelector extends React.Component<INamespaceSelectorProps> {
  public defaultProps = { createable: false };

  private getNamespaceOptions(): Array<Option<string>> {
    const { accounts, selectedAccount } = this.props;
    const selectedAccountDetails = find(accounts, a => a.name === selectedAccount);
    const namespaces = get(selectedAccountDetails, 'namespaces', []);
    const options = map(namespaces, n => ({ label: n, value: n }));
    if (this.props.createable && !includes(namespaces, this.props.selectedNamespace)) {
      options.push({ label: this.props.selectedNamespace, value: this.props.selectedNamespace });
    }
    return options;
  }

  public render() {
    const componentProps = {
      clearable: false,
      options: this.getNamespaceOptions(),
      value: this.props.selectedNamespace,
      onChange: (option: Option) => this.props.onChange(option.value.toString()),
    };
    return <>{this.props.createable ? <Creatable {...componentProps} /> : <Select {...componentProps} />}</>;
  }
}
