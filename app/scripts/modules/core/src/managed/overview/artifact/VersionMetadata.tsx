import { DateTime } from 'luxon';
import React from 'react';

import { IconTooltip } from 'core/index';
import { RelativeTimestamp } from '../../RelativeTimestamp';

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
  const elements = [
    <>Build #{buildNumber}</>,
    author ? <>By {author}</> : undefined,
    deployedAt ? (
      <>
        <div className="metadata-icon">
          <IconTooltip tooltip="Deployed at" name="cloudDeployed" size="12px" />
        </div>
        <RelativeTimestamp timestamp={DateTime.fromISO(deployedAt)} className="" style={{}} /> ago
      </>
    ) : undefined,
    buildDuration ? (
      <>
        <div className="metadata-icon">
          <IconTooltip tooltip="Build duration" name="build" size="12px" />
        </div>
        {buildDuration}
      </>
    ) : undefined,
    commitsBehind ? <>{commitsBehind}</> : undefined,
  ].filter(Boolean);

  return (
    <div>
      <div className="version-metadata">
        {elements.map((elem, index) => {
          return (
            <React.Fragment key={index}>
              {index > 0 && <span className="metatdata-separator">•</span>}
              {elem}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
