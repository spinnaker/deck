import React from 'react';
import { ShallowWrapper, shallow } from 'enzyme';
import { mock, IQService, IScope } from 'angular';

import {
  Application,
  ApplicationModelBuilder,
  Details,
  IManifest,
  IManifestContainer,
  IManifestParams,
  noop,
  timestamp,
} from '@spinnaker/core';

import {
  KubernetesAutoscalerDetails,
  IAutoscalerFromStateParams,
  IKubernetesAutoscalerProps,
} from './KubernetesAutoscalerDetails';

import { KubernetesManifestService, ManifestEvents, ManifestLabels } from 'kubernetes/v2';

describe('<KubernetesAutoscalerDetails />', () => {
  const account = 'prod';
  const createdTime = 1580742242000;
  const kind = 'HorizontalPodAutoscaler';
  const name = 'horizontalpodautoscaler autoscaler1';
  const region = 'us-east-1';

  const autoscalerMetadata: IAutoscalerFromStateParams = {
    accountId: account,
    name,
    region,
  };

  const as1 = {
    createdTime,
    instanceCounts: { up: 2, down: 0, starting: 0, succeeded: 0, failed: 0, unknown: 0, outOfService: 0 },
    manifest: { metadata: { name: 'autoscaler1' }, kind },
    name,
    account,
    region,
    serverGroups: [
      {
        account,
        name: 'statefulSet demo',
        region,
      },
    ],
  };

  const as2 = { name: 'autoscaler2', account, region };

  let $q: IQService, $scope: IScope, application: Application, wrapper: ShallowWrapper<IKubernetesAutoscalerProps, any>;

  beforeEach(
    mock.inject((_$q_: IQService, $rootScope: IScope) => {
      $q = _$q_;
      $scope = $rootScope.$new();
      application = ApplicationModelBuilder.createApplicationForTests('app', {
        key: 'autoscalers',
        loader: () => $q.resolve(application.autoscalers.data),
        onLoad: (_app, data) => $q.resolve(data),
        defaultData: [],
      });
      application.autoscalers.refresh();
      $scope.$digest();

      spyOn(KubernetesManifestService, 'makeManifestRefresher').and.callFake(
        (
          _application: Application,
          _params: IManifestParams,
          _container: IManifestContainer,
          updateCallback: (manifest: IManifest) => void,
        ) => {
          updateCallback({ manifest: {} } as IManifest);
          return noop;
        },
      );
    }),
  );

  it('Displays a message when an autoscaler is not found', () => {
    const props: IKubernetesAutoscalerProps = { app: application, autoscalerMetadata };
    wrapper = shallow(<KubernetesAutoscalerDetails {...props} />);

    application.getDataSource('autoscalers').data = [as2];
    $scope.$digest();

    expect(
      wrapper
        .find(Details)
        .render()
        .text(),
    ).toEqual('Autoscaler not found');
  });

  it("displays an autoscaler's details", () => {
    const props: IKubernetesAutoscalerProps = { app: application, autoscalerMetadata };
    wrapper = shallow(<KubernetesAutoscalerDetails {...props} />);

    application.getDataSource('autoscalers').data = [as1, as2];

    $scope.$digest();
    wrapper.update();

    const informationSection = wrapper
      .find({ heading: 'Information' })
      .find('dl')
      .render()
      .text();

    expect(informationSection).toContain(timestamp(createdTime));
    expect(informationSection).toContain(account);
    expect(informationSection).toContain(region);
    expect(informationSection).toContain(kind);

    const manifestEventsSection = wrapper.find({ heading: 'Events' }).find(ManifestEvents);
    expect(manifestEventsSection.length).toEqual(1);
    const manifestLabelsSection = wrapper.find({ heading: 'Labels' }).find(ManifestLabels);
    expect(manifestLabelsSection.length).toEqual(1);
  });
});
