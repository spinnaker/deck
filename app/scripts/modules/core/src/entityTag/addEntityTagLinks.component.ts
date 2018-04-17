import { IController, IComponentOptions, module } from 'angular';

import { Application, IEntityTag } from 'core';
import { EntityTagEditor, IEntityTagEditorProps, IOwnerOption } from './EntityTagEditor';
import './entityTags.help';

class AddEntityTagLinksCtrl implements IController {
  public application: Application;
  public tagType: string;

  private component: any;
  private entityType: string;
  private onUpdate: () => any;
  private ownerOptions: IOwnerOption[];

  public addTag(tagType: string): void {
    const tag: IEntityTag = {
      name: null,
      value: {
        message: null,
        type: tagType,
      },
    };

    const props: IEntityTagEditorProps = {
      tag,
      isNew: true,
      owner: this.component,
      entityType: this.entityType,
      application: this.application,
      entityRef: null,
      onUpdate: this.onUpdate,
      ownerOptions: this.ownerOptions,
    };

    EntityTagEditor.show(props);
  }
}

class AddEntityTagLinksComponent implements IComponentOptions {
  public bindings: any = {
    component: '<',
    application: '<',
    entityType: '@',
    onUpdate: '&?',
    tagType: '@',
    ownerOptions: '<?',
  };
  public controller: any = AddEntityTagLinksCtrl;
  public template = `
    <li role="presentation" class="divider"></li>
    <li>
      <a href ng-click="$ctrl.addTag('notice')">
        Add notice <help-field key="entityTags.{{$ctrl.entityType}}.notice"></help-field>
      </a>
    </li>
    <li>
      <a href ng-click="$ctrl.addTag('alert')">
        Add alert <help-field key="entityTags.{{$ctrl.entityType}}.alert"></help-field>
      </a>
    </li>
  `;
}

export class AddEntityTagLinksWrapperComponent implements IComponentOptions {
  public bindings: any = {
    component: '<',
    application: '<',
    entityType: '<',
    onUpdate: '<?',
    tagType: '<',
    ownerOptions: '<?',
  };
  public controller: any = AddEntityTagLinksCtrl;
  public template = `
    <add-entity-tag-links
      component="$ctrl.component"
      application="$ctrl.application"
      entity-type={{$ctrl.entityType}}
      on-update="$ctrl.onUpdate()"
      tag-type={{$ctrl.tagType}}
      owner-options="$ctrl.ownerOptions">
    </add-entity-tag-links>
  `;
}

export const ADD_ENTITY_TAG_LINKS_COMPONENT = 'spinnaker.core.entityTag.details.component';
module(ADD_ENTITY_TAG_LINKS_COMPONENT, [])
  .component('addEntityTagLinks', new AddEntityTagLinksComponent())
  .component('addEntityTagLinksWrapper', new AddEntityTagLinksWrapperComponent());
