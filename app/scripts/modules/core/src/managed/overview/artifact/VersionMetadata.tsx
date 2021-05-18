import classnames from 'classnames';
import { DateTime } from 'luxon';
import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';

import { Icon } from '@spinnaker/presentation';
import { IconTooltip, Tooltip } from 'core/presentation';

import { RelativeTimestamp } from '../../RelativeTimestamp';
import { TOOLTIP_DELAY } from '../../utils/defaults';
import './VersionMetadata.less';

const MetadataElement: React.FC<{ className?: string }> = ({ className, children }) => {
  return <span className={classnames('metadata-element', className)}>{children}</span>;
};

export interface VersionAction {
  onClick?: () => void;
  href?: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface IVersionMetadataProps {
  buildNumber?: string;
  buildLink?: string;
  author?: string;
  deployedAt?: string;
  createdAt?: string | Date;
  buildDuration?: string;
  buildsBehind?: number;
  isDeploying?: boolean;
  isPinned?: boolean;
  actions?: VersionAction[];
}

export const VersionMetadata = ({
  buildNumber,
  buildLink,
  author,
  deployedAt,
  createdAt,
  buildDuration,
  buildsBehind,
  isDeploying,
  isPinned,
  actions,
}: IVersionMetadataProps) => {
  return (
    <div>
      <div className="VersionMetadata">
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
        {buildNumber && (
          <MetadataElement>
            {buildLink ? <a href={buildLink}>Build #{buildNumber}</a> : `Build #${buildNumber}`}
          </MetadataElement>
        )}
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
              delayShow={TOOLTIP_DELAY}
              removeStyles
              withSuffix
            />
          </MetadataElement>
        )}
        {createdAt && (
          <MetadataElement>
            <Tooltip delayShow={TOOLTIP_DELAY} value="Created at">
              <i className="far fa-calendar-alt metadata-icon" />
            </Tooltip>
            <RelativeTimestamp
              timestamp={createdAt instanceof Date ? DateTime.fromJSDate(createdAt) : DateTime.fromISO(createdAt)}
              delayShow={TOOLTIP_DELAY}
              removeStyles
              withSuffix
            />
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
