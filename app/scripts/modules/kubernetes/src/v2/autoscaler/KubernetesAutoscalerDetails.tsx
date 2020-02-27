import React from 'react';
import { isEmpty, isNil } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UISref } from '@uirouter/react';

import {
  Application,
  AccountTag,
  CloudProviderLogo,
  CollapsibleSection,
  Details,
  HealthCounts,
  IManifest,
  IServerGroup,
  noop,
  relativeTime,
  timestamp,
} from '@spinnaker/core';
import { IKubernetesAutoscaler, KubernetesManifestService, ManifestEvents, ManifestLabels } from 'kubernetes/v2';

export interface IAutoscalerFromStateParams {
  accountId: string;
  name: string;
  region: string;
}

export interface IKubernetesAutoscalerProps {
  app: Application;
  autoscalerMetadata: IAutoscalerFromStateParams;
}

interface IKubernetesAutoscalerDetailsState {
  autoscaler: Partial<IKubernetesAutoscaler>;
  dataSourceUnsubscribe: () => {};
  isLoading: boolean;
  latestManifest: IManifest;
  manifestUnsubscribe: () => void;
}

export class KubernetesAutoscalerDetails extends React.Component<
  IKubernetesAutoscalerProps,
  IKubernetesAutoscalerDetailsState
> {
  public state: IKubernetesAutoscalerDetailsState = {
    autoscaler: null,
    dataSourceUnsubscribe: noop,
    isLoading: true,
    latestManifest: null,
    manifestUnsubscribe: noop,
  };

  private destroy$ = new Subject();

  public componentDidMount(): void {
    const { app, autoscalerMetadata } = this.props;
    const dataSource = app.autoscalers;

    Observable.fromPromise(dataSource.ready())
      .takeUntil(this.destroy$)
      .subscribe(() => {
        const manifestUnsubscribe = KubernetesManifestService.subscribe(
          app,
          {
            account: autoscalerMetadata.accountId,
            location: autoscalerMetadata.region,
            name: autoscalerMetadata.name,
          },
          this.updateManifest,
        );

        const dataSourceUnsubscribe = dataSource.onRefresh(null, () => this.extractAutoscaler());
        this.setState({ dataSourceUnsubscribe, manifestUnsubscribe });
        this.extractAutoscaler();
      });
  }

  public componentWillUnmount() {
    this.state.dataSourceUnsubscribe();
    this.state.manifestUnsubscribe();
    this.destroy$.next();
  }

  public updateManifest = (latestManifest: IManifest) => this.setState({ latestManifest });

  public extractAutoscaler(): void {
    const { app, autoscalerMetadata } = this.props;

    const autoscalerDef = app
      .getDataSource('autoscalers')
      .data.find(
        (autoscaler: IKubernetesAutoscaler) =>
          autoscaler.name === autoscalerMetadata.name &&
          autoscaler.account === autoscalerMetadata.accountId &&
          autoscaler.region === autoscalerMetadata.region,
      );

    if (!autoscalerDef) {
      this.setState({ autoscaler: null, isLoading: false });
      return;
    }

    this.setState({
      autoscaler: {
        account: autoscalerDef.account,
        createdTime: autoscalerDef.createdTime,
        displayName: autoscalerDef.manifest.metadata.name,
        instanceCounts: { ...autoscalerDef.instanceCounts },
        kind: autoscalerDef.manifest.kind,
        namespace: autoscalerDef.region,
        serverGroups: autoscalerDef.serverGroups,
      },
      isLoading: false,
    });
  }

  public render() {
    const { autoscaler, isLoading, latestManifest } = this.state;

    const minReplicas = latestManifest?.manifest?.spec?.minReplicas;
    const maxReplicas = latestManifest?.manifest?.spec?.maxReplicas;
    const currentCPUUtilizationPercentage = latestManifest?.manifest?.status?.currentCPUUtilizationPercentage;
    const targetCPUUtilizationPercentage = latestManifest?.manifest?.spec?.targetCPUUtilizationPercentage;
    const lastScaled = latestManifest?.manifest?.status?.lastScaleTime;

    return (
      <Details loading={isLoading}>
        {isEmpty(autoscaler) ? (
          'Autoscaler not found'
        ) : (
          <>
            <Details.Header
              icon={<CloudProviderLogo provider="kubernetes" height="36px" width="36px" />}
              name={autoscaler.displayName}
            ></Details.Header>
            <CollapsibleSection heading="Information" defaultExpanded={true}>
              <dl className="dl-horizontal dl-flex">
                <dt>Created</dt>
                <dd>{timestamp(autoscaler.createdTime)}</dd>
                <dt>Account</dt>
                <dd>
                  <AccountTag account={autoscaler.account} />
                </dd>
                <dt>Namespace</dt>
                <dd>{autoscaler.namespace}</dd>
                <dt>Kind</dt>
                <dd>{autoscaler.kind}</dd>
              </dl>
            </CollapsibleSection>
            <CollapsibleSection heading="Status" defaultExpanded={true}>
              <dl className="dl-horizontal dl-flex">
                {autoscaler.serverGroups.length > 0 ? (
                  <>
                    <dt>Workloads</dt>
                    {autoscaler.serverGroups.map(({ account, name, region }: IServerGroup) => (
                      <dd key={name}>
                        <UISref
                          to="^.serverGroup"
                          params={{
                            region,
                            accountId: account,
                            serverGroup: name,
                            provider: 'kubernetes',
                          }}
                        >
                          <a>{name}</a>
                        </UISref>
                      </dd>
                    ))}
                    {!isNil(autoscaler.instanceCounts) && (
                      <div>
                        <dt>Pod status</dt>
                        <dd>
                          <HealthCounts container={autoscaler.instanceCounts} />
                        </dd>
                      </div>
                    )}
                  </>
                ) : (
                  `No workloads associated with this ${autoscaler.kind}`
                )}
                {!isNil(minReplicas) && (
                  <div>
                    <dt>Min Replicas</dt>
                    <dd>{minReplicas}</dd>
                  </div>
                )}
                {!isNil(maxReplicas) && (
                  <div>
                    <dt>Max Replicas</dt>
                    <dd>{maxReplicas}</dd>
                  </div>
                )}
                {!isNil(currentCPUUtilizationPercentage) && (
                  <div>
                    <dt>Current CPU Utilization</dt>
                    <dd>{`${currentCPUUtilizationPercentage}%`}</dd>
                  </div>
                )}
                {!isNil(targetCPUUtilizationPercentage) && (
                  <div>
                    <dt>Target CPU Utilization</dt>
                    <dd>{`${targetCPUUtilizationPercentage}%`}</dd>
                  </div>
                )}
                {lastScaled && (
                  <div>
                    <dt>Last Scaled</dt>
                    <dd>{relativeTime(Date.parse(lastScaled))}</dd>
                  </div>
                )}
              </dl>
            </CollapsibleSection>
            {latestManifest && (
              <>
                <CollapsibleSection heading="Events" defaultExpanded={true}>
                  <ManifestEvents manifest={latestManifest} />
                </CollapsibleSection>
                <CollapsibleSection heading="Labels" defaultExpanded={true}>
                  <ManifestLabels manifest={latestManifest.manifest} />
                </CollapsibleSection>
              </>
            )}
          </>
        )}
      </Details>
    );
  }
}
