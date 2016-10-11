import {module} from 'angular';
import './numberList.component.less';

export interface NumberListConstraints {
  min: number;
  max: number;
}

export class NumberListController implements ng.IComponentController {
  public model: number[] | string;
  public constraints: NumberListConstraints;
  public label: string;
  public backingModel: number[];
  public parameterized: boolean;
  public onChange: () => any;

  public synchronize(): void {
    let model: number[] | string = this.model; // typescript union type woes
    if (model instanceof Array) {
      (<number[]> model).length = 0;
      this.backingModel.forEach(num => {
        if (num !== null) {
          (<number[]> model).push(num);
        }
      });
      model.sort((a, b) => a - b);
    }
    if (this.onChange) {
      this.onChange();
    }
  }

  public addNumber(): void {
    if (typeof this.model === 'string') {
      return;
    }
    this.backingModel.push(null);
    this.synchronize();
  }

  public remove(index: number): void {
    if (typeof this.model === 'string') {
      return;
    }
    if (this.backingModel.length > index) {
      this.backingModel.splice(index, 1);
      this.synchronize();
    }
  }

  public toggleParameterization(enable: boolean): void {
    if (enable === this.parameterized) {
      return;
    }
    if (enable) {
      this.model = '${}';
    } else {
      this.model = [];
      this.backingModel = [null];
    }
    this.parameterized = enable;
    this.synchronize();
  }

  public $onInit(): void {
    this.model = this.model || [];
    if (typeof this.model === 'string') {
      this.parameterized = true;
      return;
    }
    this.backingModel = [].concat(this.model);
    if (!this.model.length) {
      this.backingModel.push(null);
    }
    if (!this.constraints) {
      this.constraints = {
        min: Number.NEGATIVE_INFINITY,
        max: Number.POSITIVE_INFINITY
      };
    }
    if (isNaN(this.constraints.min)) {
      this.constraints.min = Number.NEGATIVE_INFINITY;
    }
    if (isNaN(this.constraints.max)) {
      this.constraints.max = Number.POSITIVE_INFINITY;
    }
    if (!this.label) {
      this.label = 'Item';
    }
  }
}

class NumberListComponent implements ng.IComponentOptions {
  public bindings: any = {
    model: '=',
    constraints: '<?',
    label: '@',
    onChange: '&',
  };

  public controller: ng.IComponentController = NumberListController;
  public template: string = `
    <div ng-if="$ctrl.parameterized">
      <input type="text" class="form-control input-sm" ng-model="$ctrl.model"/>
    </div>
    <div class="btn-group btn-group-xs btn-group-spel" role="group">
      <button type="button"
              class="btn btn-default"
              ng-click="$ctrl.toggleParameterization(false)"
              ng-class="{active: $ctrl.parameterized}"
              uib-tooltip="Toggle to enter numbers">
              Num
      </button>
      <button type="button"
              class="btn btn-default"
              ng-class="{active: !$ctrl.parameterized}"
              ng-click="$ctrl.toggleParameterization(true)"
              uib-tooltip="Toggle to enter expression">
              $\{…\}
      </button>
    </div>
    <div ng-if="!$ctrl.parameterized" class="row-number" ng-repeat="entry in $ctrl.backingModel track by $index">
      <input type="number"
             class="form-control input-sm"
             ng-model="$ctrl.backingModel[$index]" 
             ng-min="$ctrl.constraints.min" 
             ng-max="$ctrl.constraints.max"
             ng-change="$ctrl.synchronize()"
             />
      <button class="btn btn-link btn-sm" ng-click="$ctrl.remove($index)" ng-if="$index > 0"><span class="glyphicon glyphicon-trash"></span></button>
    </div>
    <div>
      <button class="btn btn-xs btn-block add-new"
              is-visible="!$ctrl.parameterized"
              ng-click="$ctrl.addNumber()">
        <span class="glyphicon glyphicon-plus-sign"></span>
        Add {{$ctrl.label}}
      </button>
    </div>
`;
}

const moduleName = 'spinnaker.core.forms.numberList';

module(moduleName, [])
  .component('numberList', new NumberListComponent());

export default moduleName;
