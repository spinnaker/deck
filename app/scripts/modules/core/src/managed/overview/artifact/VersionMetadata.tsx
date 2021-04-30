import { DateTime } from 'luxon';
import React from 'react';

import { IconTooltip } from 'core/index';

import { RelativeTimestamp } from '../../RelativeTimestamp';
import { TOOLTIP_DELAY } from '../../utils/defaults';

const MetadataElement: React.FC = ({ children }) => {
  return <span className="metadata-element">{children}</span>;
};

export const VersionMetadata = ({
  buildNumber,
  author,
  deployedAt,
  buildDuration,
  buildsBehind,
}: {
  buildNumber?: string;
  author?: string;
  deployedAt?: string;
  buildDuration?: string;
  buildsBehind?: number;
}) => {
  return (
    <div>
      <div className="version-metadata">
        <MetadataElement>Build #{buildNumber}</MetadataElement>
        {author && <MetadataElement>By {author}</MetadataElement>}
        {deployedAt && (
          <MetadataElement>
            <IconTooltip
              tooltip="Deployed at"
              name="cloudDeployed"
              size="12px"
              wrapperClassName="metadata-icon"
              delayShow={TOOLTIP_DELAY}
            />
            <RelativeTimestamp
              timestamp={DateTime.fromISO(deployedAt)}
              className=""
              style={{}}
              delayShow={TOOLTIP_DELAY}
            />{' '}
            ago
          </MetadataElement>
        )}
        {buildDuration && (
          <MetadataElement>
            <IconTooltip
              tooltip="Build duration"
              name="build"
              size="12px"
              wrapperClassName="metadata-icon"
              delayShow={TOOLTIP_DELAY}
            />
            {buildDuration}
          </MetadataElement>
        )}
        {buildsBehind && (
          <MetadataElement>
            {buildsBehind} build{buildsBehind > 1 ? 's' : ''} behind
          </MetadataElement>
        )}
      </div>
    </div>
  );
};
