import { ISubnet } from '../domain/ISubnet';

export const mockSubnet: ISubnet = {
  availabilityZone: 'us-west-1b',
  id: 'subnet-f7af8783',
  name: 'test-subnet',
  account: 'test',
  region: 'us-west-1',
  type: 'aws',
  label: 'label',
  purpose: 'testing subnets',
  deprecated: false,
  vpcId: 'vpc-9af769ff',
};
