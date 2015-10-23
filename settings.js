'use strict';

window.spinnakerSettings = {
  defaultProviders: ['aws'],
  providers: { // MOVING TO BACK END
    aws: {
      defaults: {
        account: 'test',
        region: 'us-east-1'
      },
      primaryAccounts: ['prod', 'test'],
      primaryRegions: ['eu-west-1', 'us-east-1', 'us-west-1', 'us-west-2'],
      challengeDestructiveActions: ['mgmt', 'prod', 'mceprod', 'cpl'],
      accountBastions : {
        'prod': 'aws.prod.netflix.net',
        'test': 'aws.test.netflix.net',
        'mgmt': 'aws.mgmt.netflix.net',
        'mcetest': 'awsmce.test.netflix.net',
        'mceprod': 'awsmce.prod.netflix.net',
      },
      preferredZonesByAccount: {
        prod: {
          'us-east-1': ['us-east-1c', 'us-east-1d', 'us-east-1e'],
          'us-west-1': ['us-west-1a', 'us-west-1c'],
          'us-west-2': ['us-west-2a', 'us-west-2b', 'us-west-2c'],
          'eu-west-1': ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
          'ap-northeast-1': ['ap-northeast-1a', 'ap-northeast-1b', 'ap-northeast-1c'],
          'ap-southeast-1': ['ap-southeast-1a', 'ap-southeast-1b'],
          'ap-southeast-2': ['ap-southeast-2a', 'ap-southeast-2b'],
          'sa-east-1': ['sa-east-1a', 'sa-east-1b']
        },
        test: {
          'us-east-1': ['us-east-1c', 'us-east-1d', 'us-east-1e'],
          'us-west-1': ['us-west-1a', 'us-west-1c'],
          'us-west-2': ['us-west-2a', 'us-west-2b', 'us-west-2c'],
          'eu-west-1': ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
          'ap-northeast-1': ['ap-northeast-1a', 'ap-northeast-1b', 'ap-northeast-1c'],
          'ap-southeast-1': ['ap-southeast-1a', 'ap-southeast-1b'],
          'ap-southeast-2': ['ap-southeast-2a', 'ap-southeast-2b'],
          'sa-east-1': ['sa-east-1a', 'sa-east-1b']
        },
        mgmt: {
          'us-east-1': ['us-east-1c', 'us-east-1d', 'us-east-1e'],
          'us-west-1': ['us-west-1a', 'us-west-1c'],
          'us-west-2': ['us-west-2a', 'us-west-2b', 'us-west-2c'],
          'eu-west-1': ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
          'ap-northeast-1': ['ap-northeast-1a', 'ap-northeast-1b', 'ap-northeast-1c'],
          'ap-southeast-1': ['ap-southeast-1a', 'ap-southeast-1b'],
          'ap-southeast-2': ['ap-southeast-2a', 'ap-southeast-2b'],
          'sa-east-1': ['sa-east-1a', 'sa-east-1b']
        },
        mgmttest: {
          'us-east-1': ['us-east-1c', 'us-east-1d', 'us-east-1e'],
          'us-west-1': ['us-west-1a', 'us-west-1c'],
          'us-west-2': ['us-west-2a', 'us-west-2b', 'us-west-2c'],
          'eu-west-1': ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
          'ap-northeast-1': ['ap-northeast-1a', 'ap-northeast-1b', 'ap-northeast-1c'],
          'ap-southeast-1': ['ap-southeast-1a', 'ap-southeast-1b'],
          'ap-southeast-2': ['ap-southeast-2a', 'ap-southeast-2b'],
          'sa-east-1': ['sa-east-1a', 'sa-east-1b']
        },
        mceprod: {
          'us-east-1': ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d', 'us-east-1e'],
          'us-west-1': ['us-west-1a', 'us-west-1b', 'us-west-1c'],
          'us-west-2': ['us-west-2a', 'us-west-2b', 'us-west-2c'],
          'eu-west-1': ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
          'ap-northeast-1': ['ap-northeast-1a', 'ap-northeast-1b', 'ap-northeast-1c'],
          'ap-southeast-1': ['ap-southeast-1a', 'ap-southeast-1b'],
          'ap-southeast-2': ['ap-southeast-2a', 'ap-southeast-2b'],
          'sa-east-1': ['sa-east-1a', 'sa-east-1b']
        },
        mcetest: {
          'us-east-1': ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d'],
          'us-west-1': ['us-west-1b', 'us-west-1c'],
          'us-west-2': ['us-west-2a', 'us-west-2b', 'us-west-2c'],
          'eu-west-1': ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
          'ap-northeast-1': ['ap-northeast-1a', 'ap-northeast-1b', 'ap-northeast-1c'],
          'ap-southeast-1': ['ap-southeast-1a', 'ap-southeast-1b'],
          'ap-southeast-2': ['ap-southeast-2a', 'ap-southeast-2b'],
          'sa-east-1': ['sa-east-1a', 'sa-east-1b']
        },
        default: {
          'us-east-1': ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d', 'us-east-1e'],
          'us-west-1': ['us-west-1a', 'us-west-1b', 'us-west-1c'],
          'us-west-2': ['us-west-2a', 'us-west-2b', 'us-west-2c'],
          'eu-west-1': ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
          'ap-northeast-1': ['ap-northeast-1a', 'ap-northeast-1b', 'ap-northeast-1c'],
          'ap-southeast-1': ['ap-southeast-1a', 'ap-southeast-1b'],
          'ap-southeast-2': ['ap-southeast-2a', 'ap-southeast-2b'],
          'sa-east-1': ['sa-east-1a', 'sa-east-1b']
        }
      }
    },
    titan: {
      defaults: {
        account: 'titantest',
        region: 'us-east-1'
      },
      primaryAccounts: ['test'],
      primaryRegions: ['us-east-1'],
    }
  },
};
