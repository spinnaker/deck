import React from 'react';
import _ from 'lodash';

import { $interpolate } from 'ngimport';
import { SETTINGS } from '../../config/settings';
import { CollapsibleSection } from '../../presentation';

import { Application } from '../../application';
import { IInstance } from '../../domain';

import './instanceLinks.component.less';

export interface IInstanceLinksProps {
  address: string;
  application: Application;
  instance: IInstance;
  moniker: string;
  environment: string;
}

export interface Link {
  path?: string;
  title: string;
  url: string;
}

export interface LinkSection {
  cloudProviders?: string[];
  links: Link[];
  title: string;
}

export const InstanceLinks = ({ address, application, instance, moniker, environment }: IInstanceLinksProps) => {
  const port = _.get(application, 'attributes.instancePort', SETTINGS.defaultInstancePort) || 80;
  const linkSections = _.cloneDeep(
    _.get(application, 'attributes.instanceLinks', SETTINGS.defaultInstanceLinks) || [],
  ).filter(
    (section: LinkSection) =>
      !section.cloudProviders ||
      !section.cloudProviders.length ||
      !instance.cloudProvider ||
      section.cloudProviders.includes(instance.cloudProvider),
  );

  linkSections.forEach((section: LinkSection) => {
    section.links = section.links.map(link => {
      const linkPort = link.path.indexOf(':') === 0 || !port ? '' : ':' + port;
      let url = link.path;
      // handle interpolated variables
      if (url.includes('{{')) {
        url = $interpolate(url)(
          Object.assign({}, instance, moniker, {
            ipAddress: address,
            environment: environment,
          }),
        );
      }
      // handle relative paths
      if (!url.includes('//') && !url.startsWith('{{')) {
        url = `http://${address + linkPort + url}`;
      }
      return {
        url: url,
        title: link.title || link.path,
      };
    });
  });

  return (
    <div>
      {linkSections.map((section: LinkSection) =>
        !section.links.length ? null : (
          <CollapsibleSection heading={section.title}>
            <ul>
              {section.links.map((link: Link) => (
                <li>
                  <a href={link.url} target="_blank">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        ),
      )}
    </div>
  );
};
