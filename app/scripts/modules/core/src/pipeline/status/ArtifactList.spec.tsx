import * as React from 'react';
import { ShallowWrapper, shallow } from 'enzyme';
import { mock } from 'angular';
import { REACT_MODULE } from 'core/reactShims';
import { IArtifact, IExpectedArtifact } from 'core/domain';
import { ArtifactList, IArtifactListProps, IArtifactListState } from './ArtifactList';

const ARTIFACT_TYPE = 'docker/image';
const ARTIFACT_NAME = 'example.com/container';

describe('<ArtifactList/>', () => {
  let component: ShallowWrapper<IArtifactListProps, IArtifactListState>;

  beforeEach(mock.module(REACT_MODULE));
  beforeEach(mock.inject(() => {})); // Angular is lazy.

  it('renders null when null artifacts are passed in', function() {
    const artifacts: IArtifact[] = null;
    component = shallow(<ArtifactList artifacts={artifacts} />);
    expect(component.get(0)).toEqual(null);
  });

  it('renders null when 0 artifacts are passed in', function() {
    const artifacts: IArtifact[] = [];
    const resolvedExpectedArtifacts = artifacts.map(a => ({ boundArtifact: a } as IExpectedArtifact));
    component = shallow(<ArtifactList artifacts={artifacts} resolvedExpectedArtifacts={resolvedExpectedArtifacts} />);
    expect(component.get(0)).toEqual(null);
  });

  it('renders a list when artifacts are passed in', function() {
    const artifacts: IArtifact[] = [
      {
        id: 'abcd',
        type: ARTIFACT_TYPE,
        name: ARTIFACT_NAME,
      },
    ];
    const resolvedExpectedArtifacts = artifacts.map(a => ({ boundArtifact: a } as IExpectedArtifact));
    component = shallow(<ArtifactList artifacts={artifacts} resolvedExpectedArtifacts={resolvedExpectedArtifacts} />);
    expect(component.find('ul.trigger-details.artifacts').length).toEqual(1);
  });

  it("renders an artifact's name", function() {
    const artifacts: IArtifact[] = [
      {
        id: 'abcd',
        type: ARTIFACT_TYPE,
        name: ARTIFACT_NAME,
      },
    ];
    const resolvedExpectedArtifacts = artifacts.map(a => ({ boundArtifact: a } as IExpectedArtifact));
    component = shallow(<ArtifactList artifacts={artifacts} resolvedExpectedArtifacts={resolvedExpectedArtifacts} />);
    const li = component.find('li');
    const dt = li.find('dt');
    const dd = li.find('dd');
    expect(li.length).toEqual(1);
    expect(dt.length).toEqual(1);
    expect(dd.length).toEqual(1);
    expect(dd.at(0).text()).toEqual(ARTIFACT_NAME);
  });

  it('does not render artifacts without a type and name', function() {
    const singleArtifact: IArtifact[] = [
      {
        id: 'abcd',
      },
    ];
    const resolvedExpectedArtifacts = singleArtifact.map(a => ({ boundArtifact: a } as IExpectedArtifact));
    component = shallow(
      <ArtifactList artifacts={singleArtifact} resolvedExpectedArtifacts={resolvedExpectedArtifacts} />,
    );
    expect(component.get(0)).toEqual(null);

    const artifacts: IArtifact[] = [
      {
        id: 'abcd',
      },
      {
        id: 'abcd2',
        type: ARTIFACT_TYPE,
        name: ARTIFACT_NAME,
      },
    ];
    component = shallow(<ArtifactList artifacts={artifacts} />);
    expect(component.find('ul.trigger-details.artifacts').length).toEqual(1);
  });

  it('renders an artifact version if present', function() {
    const version = 'v001';
    const artifacts: IArtifact[] = [
      {
        id: 'abcd',
        type: ARTIFACT_TYPE,
        name: ARTIFACT_NAME,
        version,
      },
    ];
    const resolvedExpectedArtifacts = artifacts.map(a => ({ boundArtifact: a } as IExpectedArtifact));
    component = shallow(<ArtifactList artifacts={artifacts} resolvedExpectedArtifacts={resolvedExpectedArtifacts} />);
    const li = component.find('li');
    expect(li.find('dd').length).toEqual(2);
    expect(
      li
        .find('dd')
        .at(1)
        .text(),
    ).toEqual(version);
  });

  it('does not render artifacts for which there is no expected artifact in the pipeline', function() {
    const artifacts: IArtifact[] = [
      {
        id: 'abcd',
        type: ARTIFACT_TYPE,
        name: ARTIFACT_NAME,
      },
    ];
    component = shallow(<ArtifactList artifacts={artifacts} />);
    const li = component.find('li');
    expect(li.text()).toMatch(/1.*artifact.*not.*consumed/);
  });
});
