import { IController, IPromise, IQService, IScope, module } from 'angular';
import { StateService } from '@uirouter/angularjs';

import {
  Application,
  CONFIRMATION_MODAL_SERVICE,
  IFunction,
  FUNCTION_READ_SERVICE,
  FunctionReader,
  MANAGED_RESOURCE_DETAILS_INDICATOR,
} from '@spinnaker/core';

import { IAmazonFunction } from 'amazon/domain';

import { FUNCTION_ACTIONS } from './functionActions.component';
import { IAmazonFunctionSourceData } from 'amazon/domain/IAmazonFunctionSourceData';

export interface IFunctionFromStateParams {
  account: string;
  region: string;
  functionName: string;
}

export class AwsFunctionDetailsController implements IController {
  public application: Application;
  public functionFromParams: IFunctionFromStateParams;
  public functionDef: IAmazonFunction;
  public state = { loading: true };

  public static $inject = ['$scope', '$state', '$q', 'functionDef', 'app', 'functionReader'];
  constructor(
    private $scope: IScope,
    private $state: StateService,
    private $q: IQService,
    functionDef: IFunctionFromStateParams,
    private app: Application,
    private functionReader: FunctionReader,
  ) {
    this.application = app;
    this.functionFromParams = functionDef;

    this.app
      .ready()
      .then(() => this.extractFunction())
      .then(() => {
        // If the user navigates away from the view before the initial extractFunctioncall completes,
        // do not bother subscribing to the refresh
        if (!$scope.$$destroyed) {
          app.getDataSource('functions').onRefresh($scope, () => this.extractFunction());
        }
      });
  }

  public autoClose(): void {
    if (this.$scope.$$destroyed) {
      return;
    }
    this.$state.params.allowModalToStayOpen = true;
    this.$state.go('^', null, { location: 'replace' });
  }

  public extractFunction(): IPromise<void> {
    const appFunction = this.app.functions.data.find((test: IFunction) => {
      return (
        test.functionName === this.functionFromParams.functionName &&
        test.region === this.functionFromParams.region &&
        test.account === this.functionFromParams.account
      );
    });
    if (appFunction) {
      const detailsLoader = this.functionReader.getFunctionDetails(
        'aws',
        this.functionFromParams.account,
        this.functionFromParams.region,
        this.functionFromParams.functionName,
      );
      return detailsLoader.then(
        (details: IAmazonFunctionSourceData[]) => {
          this.functionDef = appFunction;
          this.state.loading = false;

          if (details.length) {
            this.functionDef.credentials = this.functionFromParams.account;
          }
        },
        () => this.autoClose(),
      );
    } else {
      this.autoClose();
    }
    if (!this.functionDef) {
      this.autoClose();
    }
    return this.$q.when(null);
  }
}

export const AWS_FUNCTION_DETAILS_CTRL = 'spinnaker.amazon.function.details.controller';
module(AWS_FUNCTION_DETAILS_CTRL, [
  require('@uirouter/angularjs').default,
  FUNCTION_ACTIONS,
  FUNCTION_READ_SERVICE,
  CONFIRMATION_MODAL_SERVICE,
  MANAGED_RESOURCE_DETAILS_INDICATOR,
]).controller('awsFunctionDetailsCtrl', AwsFunctionDetailsController);
