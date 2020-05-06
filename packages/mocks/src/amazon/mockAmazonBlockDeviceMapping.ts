import { IEbsBlockDevice, IBlockDeviceMapping } from '@spinnaker/amazon';

export const createMockEbsBlockDevice = (size?: number, type?: string): IEbsBlockDevice => ({
  deleteOnTermination: false,
  encrypted: true,
  volumeSize: size || 40,
  volumeType: type || 'standard',
});

export const createMockBlockDeviceMapping = (customEbs?: IEbsBlockDevice) => ({
  deviceName: '/dev/sdb',
  ebs: customEbs || createMockEbsBlockDevice(),
});
