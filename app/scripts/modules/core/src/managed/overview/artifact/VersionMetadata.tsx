import { DateTime } from 'luxon';
import React from 'react';

import { IconTooltip } from 'core/index';
import { RelativeTimestamp } from '../../RelativeTimestamp';

const MetadataElement: React.FC = ({ children }) => {
  return <span className="metadata-element">{children}</span>;
};

export const VersionMetadata = ({
  buildNumber,
  author,
  deployedAt,
  buildDuration,
  commitsBehind,
}: {
  buildNumber?: string;
  author?: string;
  deployedAt?: string;
  buildDuration?: string;
  commitsBehind?: number;
}) => {
  return (
    <div>
      <div className="version-metadata">
        <MetadataElement>Build #{buildNumber}</MetadataElement>
        {author && <MetadataElement>By {author}</MetadataElement>}
        {deployedAt && (
          <MetadataElement>
            <IconTooltip tooltip="Deployed at" name="cloudDeployed" size="12px" wrapperClassName="metadata-icon" />
            <RelativeTimestamp timestamp={DateTime.fromISO(deployedAt)} className="" style={{}} /> ago
          </MetadataElement>
        )}
        {buildDuration && (
          <MetadataElement>
            <IconTooltip tooltip="Build duration" name="build" size="12px" wrapperClassName="metadata-icon" />
            {buildDuration}
          </MetadataElement>
        )}
        {commitsBehind && <MetadataElement>{commitsBehind}</MetadataElement>}
      </div>
    </div>
  );
};
