import {
  IAttributes,
  ICompileService,
  IComponentOptions,
  IController,
  IControllerService,
  IRootElementService,
  IRootScopeService,
  module,
} from 'angular';
import { IArtifact, IArtifactKindConfig } from 'core/domain';
import { Registry } from 'core/registry';
import { ArtifactIconService } from 'core';

class ArtifactCtrl implements IController {
  public artifact: IArtifact;
  public options: IArtifactKindConfig[];
  public description: string;
  private isDefault: boolean;
  private isMatch: boolean;
  public selectedLabel: string;
  public selectedIcon: string;

  constructor(
    private $attrs: IAttributes,
    private $controller: IControllerService,
    private $compile: ICompileService,
    private $element: IRootElementService,
    private $rootScope: IRootScopeService,
  ) {
    'ngInject';
    if (this.$attrs.$attr.hasOwnProperty('isDefault')) {
      this.isDefault = true;
    }

    if (this.$attrs.$attr.hasOwnProperty('isMatch')) {
      this.isMatch = true;
    }
    this.options = Registry.pipeline.getArtifactKinds();
  }

  private renderArtifactConfigTemplate(config: any) {
    const { controller: ctrl, template } = config;
    const controller = this.$controller(ctrl, { artifact: this.artifact });
    const scope = this.$rootScope.$new();
    const controllerAs = config.controllerAs;
    if (controllerAs) {
      scope[config.controllerAs] = controller;
    } else {
      scope['ctrl'] = controller;
    }

    const templateBody = this.$compile(template)(scope) as any;
    this.$element.find('.artifact-body').html(templateBody);
  }

  public $onInit(): void {
    this.loadArtifactKind();
  }

  public getOptions(): IArtifactKindConfig[] {
    return this.options.filter(o => o.isDefault === this.isDefault || o.isMatch === this.isMatch);
  }

  public loadArtifactKind(): void {
    const { kind } = this.artifact;
    if (!kind) {
      return;
    }
    const artifactKindConfig = this.options.filter(function(config) {
      return config.key === kind;
    });

    if (artifactKindConfig.length) {
      const config = artifactKindConfig[0];
      this.description = config.description;
      this.renderArtifactConfigTemplate(config);
      this.selectedLabel = config.label;
      this.selectedIcon = ArtifactIconService.getPath(config.type);
    }
  }

  public artifactIconPath(artifact: IArtifact) {
    return ArtifactIconService.getPath(artifact.type);
  }
}

class ArtifactComponent implements IComponentOptions {
  public bindings: any = { artifact: '=' };
  public controller: any = ArtifactCtrl;
  public controllerAs = 'ctrl';
  public template = `
<div class="form-group">
  <div class="col-md-4 col-md-offset-1">
    <ui-select class="form-control input-sm"
               required
               ng-model="ctrl.artifact.kind"
               on-select="ctrl.loadArtifactKind()">
      <ui-select-match>
        <img width="20" height="20" ng-if="ctrl.selectedIcon" ng-src="{{ ctrl.selectedIcon }}" />
        {{ ctrl.selectedLabel }}
      </ui-select-match>
      <ui-select-choices repeat="option.key as option in ctrl.getOptions() | filter: { label: $select.search }">
        <img width="20" height="20" ng-if="ctrl.artifactIconPath(option)" ng-src="{{ ctrl.artifactIconPath(option) }}" />
        <span>{{ option.label }}</span>
      </ui-select-choices>
    </ui-select>
  </div>
  <div class="col-md-6">
    {{ctrl.description}}
  </div>
</div>
<hr>
<div class="form-group">
  <div class="col-md-12">
    <div class="artifact-body"></div>
  </div>
</div>
`;
}

export const ARTIFACT = 'spinnaker.core.pipeline.config.trigger.artifacts.artifact';
module(ARTIFACT, []).component('artifact', new ArtifactComponent());
