import { get } from 'lodash';
import { Validators, robotToHuman, spelNumberCheck } from '@spinnaker/core';
import { ITargetGroup } from 'amazon/domain';

export const isNameInUse = (
  existingNames: { [account: string]: { [region: string]: string[] } },
  credentials: string,
  region: string,
) => (name: string) =>
  get(existingNames, [credentials, region], []).includes(name.toLowerCase())
    ? `There is already a target group in ${credentials}:${region} with that name.`
    : null;

export const isNameLong = (appNameLength: number) => (name: string) =>
  name.length < 32 - appNameLength
    ? null
    : 'Target group name is automatically prefixed with the application name and cannot exceed 32 characters in length.';

export const isDuplicateName = (duplicateGroups: string[]) => (name: string) =>
  !duplicateGroups.includes(name) ? null : 'Duplicate target group name in this load balancer.';

export const isValidTimeout = (targetGroup: ITargetGroup) => (value: string) => {
  const num = Number.parseInt(value, 10);
  const { protocol, healthCheckProtocol } = targetGroup;

  if (protocol === 'TCP' || protocol === 'TLS') {
    if (healthCheckProtocol === 'HTTP' && num !== 6) {
      return 'HTTP health check timeouts for TCP/TLS target groups must be 6s';
    }

    if ((healthCheckProtocol === 'HTTPS' || healthCheckProtocol === 'TLS') && num !== 10) {
      return 'HTTPS/TLS health check timeouts for TCP/TLS target groups must be 10s';
    }
  }
  return null;
};

export const isValidHealthCheckProtocol = (targetGroup: ITargetGroup) => (value: string) =>
  targetGroup.healthCheckProtocol === 'TCP' && (Number.parseInt(value, 10) !== 10 || Number.parseInt(value, 10) !== 30)
    ? 'TCP health checks only support 10s and 30s intervals'
    : null;

export const checkBetween = (fieldName: string, min: number, max: number) => (value: string) => {
  const sanitizedField = Number.parseInt(value, 10);

  if (!Number.isNaN(sanitizedField)) {
    const error =
      Validators.minValue(min)(sanitizedField, robotToHuman(fieldName)) ||
      Validators.maxValue(max)(sanitizedField, robotToHuman(fieldName));

    return error;
  }
  return null;
};

export const spelNumber = (value: number | string) => spelNumberCheck(value);
