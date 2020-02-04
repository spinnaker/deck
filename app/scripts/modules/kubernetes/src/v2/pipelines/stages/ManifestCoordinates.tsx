import React from 'react';
import { get, flatten } from 'lodash';

import { StageConstants } from '@spinnaker/core';

import { ManifestLabelSelectors } from '../../manifest/selector/ManifestLabelSelectors';
import { IManifestLabelSelectors } from '../../manifest/selector/IManifestLabelSelector';

export interface IManifestCoordinateProps {
  account: string;
  manifestName: string;
  location: string;
  cluster: string;
  criteria: string;
  labelSelectors: IManifestLabelSelectors;
  manifestNamesByNamespace: IManifestNamesByNamespace;
}

export interface IManifestNamesByNamespace {
  [namespace: string]: string[];
}

const mapCriteriaToLabel = (criteria: string): string =>
  get(
    StageConstants.MANIFEST_CRITERIA_OPTIONS.find(option => option.val === criteria),
    'label',
  );

const formatLabelSelectors = (labelSelectors: IManifestLabelSelectors): string => {
  return (labelSelectors.selectors || [])
    .map(selector => ManifestLabelSelectors.formatLabelSelector(selector))
    .filter(formatted => !!formatted)
    .join(', ');
};

const formatManifestNames = (manifestName: string, manifestNamesByNamespace: IManifestNamesByNamespace) => {
  if (manifestName) {
    return (
      <>
        <dt>Manifest</dt>
        <dd>{manifestName}</dd>
      </>
    );
  } else if (manifestNamesByNamespace) {
    const names = flatten(Object.values(manifestNamesByNamespace));
    return (
      <>
        <dt>
          Manifest
          {names.length > 1 ? 's' : ''}
        </dt>
        <dd>{names.join(', ')}</dd>
      </>
    );
  } else {
    return null;
  }
};

export const ManifestCoordinates = ({
  account,
  manifestName,
  location,
  cluster,
  criteria,
  labelSelectors,
  manifestNamesByNamespace,
}: IManifestCoordinateProps) => {
  return (
    <>
      <dt>Account</dt>
      <dd>{account}</dd>
      {formatManifestNames(manifestName, manifestNamesByNamespace)}
      <dt>Namespace</dt>
      <dd>{location}</dd>
      {mapCriteriaToLabel(criteria) != null && cluster != null && (
        <>
          <dt>Target</dt>
          <dd>{`${mapCriteriaToLabel(criteria)} in cluster ${cluster}`}</dd>
        </>
      )}
      {labelSelectors != null && !!formatLabelSelectors(labelSelectors) && (
        <>
          <dt>
            Selector
            {(labelSelectors.selectors || []).length > 1 ? 's' : ''}
          </dt>
          <dd>{formatLabelSelectors(labelSelectors)}</dd>
        </>
      )}
    </>
  );
};
