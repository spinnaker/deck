import * as Validators from './targetGroupValidators';

const mockTargetGroup = {
  attributes: {
    deregistrationDelay: 600,
    stickinessDuration: 8400,
    stickinessEnabled: false,
    stickinessType: 'lb_cookie',
  },
  healthCheckInterval: 10,
  healthCheckPath: '/healthcheck',
  healthCheckPort: 7001,
  healthCheckProtocol: 'HTTP',
  healthCheckTimeout: 5,
  healthyThreshold: 10,
  name: 'targetgroup',
  port: 7001,
  protocol: 'HTTP',
  targetType: 'ip',
  unhealthyThreshold: 2,
  account: 'test',
  cloudProvider: 'aws',
  healthTimeout: 1000,
  healthInterval: 10,
  loadBalancerNames: ['loadbalancer1', 'loadbalancer2'],
  region: 'us-east-1',
  type: '',
};

describe('Target Group validators', () => {
  describe('of used names', () => {
    it('returns an error if the name exists already', () => {
      const existingGroups = {
        test: {
          'us-east-1': ['targetgroup'],
        },
      };
      const actual = Validators.isNameInUse(existingGroups, 'test', 'us-east-1')(mockTargetGroup.name);
      const expected = 'There is already a target group in test:us-east-1 with that name.';
      expect(actual).toEqual(expected);
    });

    it('returns an null if it does not exist', () => {
      const existingGroups = {
        test: {
          'us-east-1': ['targetgroup2'],
        },
      };
      const actual = Validators.isNameInUse(existingGroups, 'test', 'us-east-1')(mockTargetGroup.name);
      expect(actual).toEqual(null);
    });
  });

  describe('of name length', () => {
    it('returns error if the name is >32 additional characters', () => {
      const actual = Validators.isNameLong(12)(`${mockTargetGroup.name}areallylongname`);
      const expected =
        'Target group name is automatically prefixed with the application name and cannot exceed 32 characters in length.';
      expect(actual).toEqual(expected);
    });

    it('returns null if the name is < 32', () => {
      const actual = Validators.isNameLong(12)(mockTargetGroup.name);
      expect(actual).toEqual(null);
    });
  });

  describe('of duplicate names across the load balancer', () => {
    it('returns an error if the name exists', () => {
      const actual = Validators.isDuplicateName(['targetgroup'])(mockTargetGroup.name);
      const expected = 'Duplicate target group name in this load balancer.';
      expect(actual).toEqual(expected);
    });

    it('returns null if the name is new', () => {
      const actual = Validators.isDuplicateName(['targetGroup2'])(mockTargetGroup.name);
      expect(actual).toEqual(null);
    });
  });

  describe('of health check timeout constraints', () => {
    const tg = {
      ...mockTargetGroup,
      protocol: 'TCP',
      healthCheckProtocol: 'HTTP',
    };

    it('should have a 6s timeout', () => {
      const actual = Validators.isValidTimeout(tg)('8');
      const expected = 'HTTP health check timeouts for TCP/TLS target groups must be 6s';
      expect(actual).toEqual(expected);
    });

    it('should be 6s and is valid', () => {
      const actual = Validators.isValidTimeout(tg)('6');
      expect(actual).toEqual(null);
    });

    it('should have a 10s timeout', () => {
      const actual = Validators.isValidTimeout({ ...tg, healthCheckProtocol: 'HTTPS' })('9');
      const expected = 'HTTPS/TLS health check timeouts for TCP/TLS target groups must be 10s';
      expect(actual).toEqual(expected);
    });

    it('should be 10s and is valid', () => {
      const actual = Validators.isValidTimeout({ ...tg, healthCheckProtocol: 'HTTPS' })('10');
      expect(actual).toEqual(null);
    });

    it('should not have a timeout constraint', () => {
      const actual = Validators.isValidTimeout(mockTargetGroup)('10');
      expect(actual).toEqual(null);
    });
  });

  describe('of health check interval', () => {
    const tg = {
      ...mockTargetGroup,
      healthCheckProtocol: 'TCP',
    };

    it('TCPs can have a 10s interval', () => {
      const actual = Validators.isValidHealthCheckInterval(tg)('10');
      expect(actual).toEqual(null);
    });

    it('TCPs can have a 30s interval', () => {
      const actual = Validators.isValidHealthCheckInterval(tg)('30');
      expect(actual).toEqual(null);
    });

    it('returns an error when it fails TCP rules', () => {
      const actual = Validators.isValidHealthCheckInterval(tg)('20');
      const expected = 'TCP health checks only support 10s and 30s intervals';
      expect(actual).toEqual(expected);
    });

    it('is not a TCP protocol target group', () => {
      const actual = Validators.isValidHealthCheckInterval(mockTargetGroup)('20');
      expect(actual).toEqual(null);
    });
  });

  describe('of max/min limits', () => {
    it('returns an error when less than min', () => {
      const actual = Validators.checkBetween('field', 10, 100)('8');
      const expected = ' Field cannot be less than 10';
      expect(actual).toEqual(expected);
    });

    it('returns an error when greater than max', () => {
      const actual = Validators.checkBetween('field', 10, 100)('125');
      const expected = ' Field cannot be greater than 100';
      expect(actual).toEqual(expected);
    });

    it('returns null when within limits', () => {
      const actual = Validators.checkBetween('field', 10, 100)('50');
      expect(actual).toEqual(null);
    });
  });
});
