import * as React from 'react';
import { IOverridableProps, Overrides } from 'core/overrideRegistry';

import {
  Details,
  CollapsibleSection,
  IFunction,
  Application,
  FunctionReader,
  AccountTag,
  IAmazonFunction,
  ManagedResourceDetailsIndicator,
} from '@spinnaker/core';
import { IAmazonFunctionSourceData } from 'amazon/domain';
import { FunctionActions } from './FunctionActions';

export interface IFunctionFromStateParams {
  account: string;
  region: string;
  functionName: string;
}

export interface IAmazonFunctionDetailsProps extends IOverridableProps {
  app: Application;
  functionObj: IFunction;
}

@Overrides('function.details', 'aws')
export class AmazonFunctionDetails extends React.Component<IAmazonFunctionDetailsProps, any> {
  private static functionReader = new FunctionReader();
  constructor(props: IAmazonFunctionDetailsProps) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  public extractFunction(): void {
    const { app, functionObj: functionFromProps } = this.props;

    const functionDef = app.functions.data.find((test: IFunction) => {
      return (
        test.functionName === functionFromProps.name &&
        test.region === functionFromProps.region &&
        test.account === functionFromProps.accountId
      );
    });

    if (functionDef) {
      AmazonFunctionDetails.functionReader
        .getFunctionDetails('aws', functionFromProps.accountId, functionFromProps.region, functionFromProps.name)
        .then((details: IAmazonFunctionSourceData[]) => {
          if (details.length) {
            this.setState({
              functionDef: details[0] as IAmazonFunction,
              loading: false,
            });
          }
        });
    }
  }

  public componentDidMount(): void {
    const { app } = this.props;
    const dataSource = app.functions;
    dataSource.ready().then(() => {
      const dataSourceUnsubscribe = dataSource.onRefresh(null, () => this.extractFunction());
      this.setState({ dataSourceUnsubscribe });
      this.extractFunction();
    });
  }

  public componentWillUnmount() {
    this.state.dataSourceUnsubscribe && this.state.dataSourceUnsubscribe();
  }

  public render() {
    const { app, functionObj: functionProp } = this.props;
    const { loading, functionDef } = this.state;

    if (loading) {
      // Don't bother computing any children if we're loading
      return <Details loading={loading} />;
    }

    const functionDetails = (
      <>
        <dl className="horizontal-when-filters-collapsed dl-horizontal dl-flex">
          <dt>Last Modified </dt>
          <dd>{functionDef.lastModified}</dd>
          <dt>In</dt>
          <dd>
            <AccountTag account={functionDef.account} /> {functionDef.region}
          </dd>
          <dt>VPC</dt>
          <dd>{functionDef.vpcId ? functionDef.vpcId : 'Default'}</dd>
          <dt>Function ARN</dt>
          <dd>{functionDef.functionArn}</dd>
          <dt>Revision ID</dt>
          <dd>{functionDef.revisionId}</dd>
          <dt>Version</dt>
          <dd>{functionDef.version}</dd>
        </dl>
      </>
    );

    const functionDetailsSection = (
      <CollapsibleSection heading="Function Details">{functionDetails}</CollapsibleSection>
    );

    return (
      <Details loading={this.state.loading}>
        <Details.Header icon={<i className="fa icon-sitemap" />} name={this.state.functionDef.functionName}>
          <div className="actions">
            {
              <FunctionActions
                app={app}
                functionDef={functionDef}
                functionFromParams={{
                  account: this.state.functionDef.account,
                  region: this.state.functionDef.region,
                  functionName: this.state.functionDef.functionName,
                }}
              />
            }
          </div>
        </Details.Header>
        {functionDef.entityTags && <ManagedResourceDetailsIndicator entityTags={functionDef.entityTags} />}
        {functionDetailsSection}
      </Details>
    );
  }
}
