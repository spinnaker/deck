import cx from 'classnames';
import { DateTime } from 'luxon';
import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';

import { Icon } from '@spinnaker/presentation';
import { IconTooltip } from 'core/index';

import { RelativeTimestamp } from '../../RelativeTimestamp';
import { TOOLTIP_DELAY } from '../../utils/defaults';

const MetadataElement: React.FC<{ className?: string }> = ({ className, children }) => {
  return <span className={cx('metadata-element', className)}>{children}</span>;
};

export interface VersionAction {
  onClick?: () => void;
  href?: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export const VersionMetadata = ({
  buildNumber,
  buildLink,
  author,
  deployedAt,
  buildDuration,
  buildsBehind,
  isDeploying,
  isPinned,
  actions,
}: {
  buildNumber?: string;
  buildLink?: string;
  author?: string;
  deployedAt?: string;
  buildDuration?: string;
  buildsBehind?: number;
  isDeploying?: boolean;
  isPinned?: boolean;
  actions?: VersionAction[];
}) => {
  return (
    <div>
      <div className="version-metadata">
        {isDeploying && (
          <MetadataElement>
            <span className="version-deploying version-badge">Deploying</span>
          </MetadataElement>
        )}
        {isPinned && (
          <MetadataElement>
            <span className="version-pinned version-badge">
              <Icon name="pin" size="12px" color="black" /> Pinned
            </span>
          </MetadataElement>
        )}
        <MetadataElement>
          Build <a href={buildLink}>#{buildNumber}</a>
        </MetadataElement>
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
            />
            {' ago'}
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
        {buildsBehind ? (
          <MetadataElement>
            {buildsBehind} build{buildsBehind > 1 ? 's' : ''} behind
          </MetadataElement>
        ) : null}
        {actions && (
          <MetadataElement>
            <Dropdown id={`${buildNumber}-actions`}>
              <Dropdown.Toggle className="element-actions-menu-toggle">Actions</Dropdown.Toggle>
              <Dropdown.Menu>
                {actions.map((action, index) => (
                  <MenuItem
                    key={index}
                    disabled={action.disabled}
                    onClick={action.onClick}
                    href={action.href}
                    target="_blank"
                  >
                    {action.content}
                  </MenuItem>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </MetadataElement>
        )}
      </div>
    </div>
  );
};
