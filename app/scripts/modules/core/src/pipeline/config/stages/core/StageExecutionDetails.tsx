import * as React from 'react';

import { IExecutionDetailsComponentProps, IExecutionDetailsComponentState } from 'core/domain';
import { ExecutionDetailsSectionNav } from 'core/delivery/details';
import { ReactInjector } from 'core/reactShims';

export class StageExecutionDetails extends React.Component<IExecutionDetailsComponentProps, IExecutionDetailsComponentState> {
  constructor(props: IExecutionDetailsComponentProps) {
    super(props);
    this.state = {
      configSections: props.detailsSections.map((s) => s.title),
      currentSection: null,
    }
  }

  public updateCurrentSection(): void {
    const currentSection = ReactInjector.$stateParams.details;
    if (this.state.currentSection !== currentSection) {
      this.setState({ currentSection });
    }
  }

  public syncDetails(configSections: string[]): void {
    ReactInjector.executionDetailsSectionService.synchronizeSection(configSections, () => this.updateCurrentSection());
  }

  public componentDidMount(): void {
    this.syncDetails(this.state.configSections);
  }

  public componentWillReceiveProps(nextProps: IExecutionDetailsComponentProps): void {
    const configSections = nextProps.detailsSections.map((s) => s.title);
    this.setState({ configSections });
    this.syncDetails(configSections);
  }

  public render() {
    const { configSections, currentSection } = this.state;
    return (
      <div>
        <ExecutionDetailsSectionNav sections={configSections} />
        {this.props.detailsSections.map((Section) => (
          <Section key={Section.title} name={Section.title} current={currentSection} {...this.props} />
        ))}
      </div>
    );
  }
}
