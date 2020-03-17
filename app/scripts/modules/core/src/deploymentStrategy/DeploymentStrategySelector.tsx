import React from 'react';
import Select, { Option } from 'react-select';
import { unset } from 'lodash';

import { HelpField } from 'core/help/HelpField';
import { Markdown, FormikFormField } from 'core/presentation';
import { IServerGroupCommand } from 'core/serverGroup';

import {
  DeploymentStrategyRegistry,
  IDeploymentStrategy,
  IDeploymentStrategyAdditionalFieldsProps,
} from './deploymentStrategy.registry';

export interface IDeploymentStrategySelectorProps {
  command: IServerGroupCommand;
  onFieldChange: (key: string, value: any) => void;
  onStrategyChange: (command: IServerGroupCommand, strategy: IDeploymentStrategy) => void;
  labelColumns?: string;
  fieldColumns?: string;
  useSystemLayout?: boolean;
}

export interface IDeploymentStrategySelectorState {
  strategies: IDeploymentStrategy[];
  currentStrategy: string;
  AdditionalFieldsComponent: React.ComponentType<IDeploymentStrategyAdditionalFieldsProps>;
}

export class DeploymentStrategySelector extends React.Component<
  IDeploymentStrategySelectorProps,
  IDeploymentStrategySelectorState
> {
  public static defaultProps: Partial<IDeploymentStrategySelectorProps> = {
    fieldColumns: '7',
    labelColumns: '3',
  };

  public state: IDeploymentStrategySelectorState = {
    strategies: DeploymentStrategyRegistry.listStrategies(
      this.props.command.selectedProvider || this.props.command.cloudProvider,
    ),
    currentStrategy: null,
    AdditionalFieldsComponent: undefined,
  };

  public selectStrategy(strategy: string, onMount = false): void {
    const { command, onStrategyChange } = this.props;

    const oldStrategy = DeploymentStrategyRegistry.getStrategy(this.state.currentStrategy);
    const newStrategy = DeploymentStrategyRegistry.getStrategy(strategy);

    if (oldStrategy && oldStrategy.additionalFields) {
      oldStrategy.additionalFields.forEach(field => {
        if (!newStrategy || !newStrategy.additionalFields || !newStrategy.additionalFields.includes(field)) {
          unset(command, field);
        }
      });
    }

    let AdditionalFieldsComponent;
    if (newStrategy) {
      AdditionalFieldsComponent = newStrategy.AdditionalFieldsComponent;
      // do not run on mount otherwise we'll confusingly fill in things that weren't there
      if (newStrategy.initializationMethod && !onMount) {
        newStrategy.initializationMethod(command);
      }
    }
    // Usage of the angular <deployment-strategy-selector> do not have an onStrategyChange and simply expect command.strategy to be updated
    // This was previously done by <ui-select ng-model="$ctrl.command.strategy">
    command.strategy = strategy;
    if (onStrategyChange && newStrategy) {
      onStrategyChange(command, newStrategy);
    }

    this.setState({ currentStrategy: strategy, AdditionalFieldsComponent });
  }

  public strategyChanged = (option: Option<IDeploymentStrategy>) => {
    this.selectStrategy(option.key);
  };

  public componentDidMount() {
    this.selectStrategy(this.props.command.strategy, true);
  }

  public render() {
    const { command, fieldColumns, labelColumns, useSystemLayout, onFieldChange } = this.props;
    const { AdditionalFieldsComponent, currentStrategy, strategies } = this.state;
    const hasAdditionalFields = Boolean(AdditionalFieldsComponent);
    const selectField = (
      <Select
        clearable={false}
        options={strategies}
        optionRenderer={this.strategyOptionRenderer}
        placeholder="None"
        required={true}
        value={currentStrategy}
        valueKey="key"
        valueRenderer={o => <>{o.label}</>}
        onChange={this.strategyChanged}
      />
    );
    const label = 'Strategy';
    const help = <HelpField id="core.serverGroup.strategy" />;
    const additionalFields = hasAdditionalFields ? (
      <AdditionalFieldsComponent command={command} onChange={onFieldChange} />
    ) : null;

    if (strategies && strategies.length) {
      return useSystemLayout ? (
        <FormikFormField
          label={label}
          name="strategy"
          help={help}
          input={() => (
            <div>
              {selectField}
              <div style={{ marginTop: '5px' }}>{additionalFields}</div>
            </div>
          )}
        />
      ) : (
        <div className="form-group">
          <div className={`col-md-${labelColumns} sm-label-right`} style={{ paddingLeft: '13px' }}>
            {label}
            {help}
          </div>
          <div className={`col-md-${fieldColumns}`}>{selectField}</div>
          <div className="col-md-9 col-md-offset-3" style={{ marginTop: '5px' }}>
            {additionalFields}
          </div>
        </div>
      );
    }

    return null;
  }

  private strategyOptionRenderer = (option: IDeploymentStrategy) => {
    return (
      <div className="body-regular">
        <strong>
          <Markdown tag="span" message={option.label} />
        </strong>
        <div>
          <Markdown tag="span" message={option.description} />
        </div>
      </div>
    );
  };
}
