import { ConfigFileArtifactList } from './ConfigFileArtifactList';
import { mount } from 'enzyme';
import { IArtifactAccountPair } from 'core';
import React from 'react';
import { mockDeployStage, mockPipeline } from '@spinnaker/mocks';
import { StageArtifactSelector } from '@spinnaker/core';

describe('<ConfigFileArtifactList/>', () => {
  // let component: ReactWrapper<IConfigFileArtifactListProps, any>;

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
    //const configArtifacts: IArtifactAccountPair[] = [{'account': 'acc', 'id': '123', 'artifact': {'id': '123'}}]
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
        updateConfigArtifacts={}
      />,
    );
    expect(wrapper.find(StageArtifactSelector).length).toBe(0);
  });
});
