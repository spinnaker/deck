import * as React from 'react';

import { Application } from 'core/application';
import { IEntityRef, IEntityTag } from 'core/domain';
import { HelpField } from 'core/help';
import { EntityTagEditor, IOwnerOption } from './EntityTagEditor';

export interface IAddEntityTagLinksProps {
  application: Application;
  component: any;
  entityType: string;
  onUpdate?: () => any;
  ownerOptions?: IOwnerOption[];
  tagType?: string;
}

export const AddEntityTagLinks = ({
  application,
  component,
  entityType,
  onUpdate,
  ownerOptions,
}: IAddEntityTagLinksProps) => {
  const addTag = (tagType: string) => {
    const tagProps = {
      application,
      entityType,
      entityRef: null as IEntityRef,
      isNew: true,
      onUpdate,
      owner: component,
      ownerOptions,
      tag: {
        name: null,
        value: {
          message: null,
          type: tagType,
        },
      } as IEntityTag,
    };

    EntityTagEditor.show(tagProps);
  };

  return (
    <>
      <li className="divider"></li>
      <li>
        <a onClick={() => addTag('notice')}>
          Add notice <HelpField id={`entityTags.${entityType}.notice`} />
        </a>
      </li>
      <li>
        <a onClick={() => addTag('alert')}>
          Add alert <HelpField id={`entityTags.${entityType}.alert`} />
        </a>
      </li>
    </>
  );
};
