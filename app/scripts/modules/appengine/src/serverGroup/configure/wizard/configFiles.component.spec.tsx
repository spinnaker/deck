import { ConfigFileArtifactList } from './ConfigFileArtifactList';
import { mount } from 'enzyme';
import { API, IArtifactAccount, IArtifactAccountPair } from 'core';
import React from 'react';
import { mock } from 'angular';
import { mockDeployStage, mockPipeline } from '@spinnaker/mocks';
import { StageArtifactSelector } from '@spinnaker/core';

describe('<ConfigFileArtifactList/>', () => {
  // let component: ReactWrapper<IConfigFileArtifactListProps, any>;

  let $http: ng.IHttpBackendService;
  beforeEach(
    mock.inject(function($httpBackend: ng.IHttpBackendService) {
      $http = $httpBackend;
    }),
  );

  it('renders empty children when null/empty artifacts are passed in', () => {
    const configArtifacts: IArtifactAccountPair[] = [];
    const wrapper = mount(
      <ConfigFileArtifactList
        configArtifacts={configArtifacts}
        pipeline={mockPipeline}
        stage={mockDeployStage}
        updateConfigArtifacts={() => {}}
      />,
    );
    expect(wrapper.find(StageArtifactSelector).length).toBe(0);
  });

  fit('renders 1 children when 1 artifacts are passed in', () => {
    const body: IArtifactAccount[] = [
      {
        name: 'arrrgh',
        types: ['arrrgh', 'you'],
      },
    ];
    $http.expectGET(`${API.baseUrl}/artifacts/credentials`).respond(200, body);

    const configArtifacts = [
      {
        account: 'acc',
        id: '123abc',
        artifact: {
          id: '123abc',
        },
      },
    ];

    const wrapper = mount(
      <ConfigFileArtifactList
        configArtifacts={configArtifacts}
        pipeline={mockPipeline}
        stage={mockDeployStage}
        updateConfigArtifacts={() => {
          console.log('configFiles.component.spec.tsx:::42@16:34');
        }}
      />,
    );

    expect(wrapper.find(StageArtifactSelector).length).toBe(1);
    $http.flush();
  });
});
