import { IPromise, IQService, module } from 'angular';

import { API } from 'core/api/ApiService';
import { IFunctionSourceData, IFunction } from 'core/domain';

export interface IFunctionByAccount {
  name: string;
  accounts: Array<{
    name: string;
    regions: Array<{
      name: string;
      functions: IFunctionSourceData[];
    }>;
  }>;
}

export class FunctionReader {
  public static $inject = ['$q', 'functionTransformer'];
  public constructor(private $q: IQService, private functionTransformer: any) {}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 029975c87... Fix for displaying list of functions
  public loadFunctions(applicationName: string): IPromise<IFunctionSourceData[]> {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    console.log('Function Reader in the read service: ' + applicationName);
=======
  public loadFunction(applicationName: string): IPromise<IFunctionsSourceData[]> {
    console.log('Function Reader in the read service: ' + applicationName);
=======
    // console.log('Function Reader in the read service: ' + applicationName);
>>>>>>> 6e6e3db9d... Added a fix that filters subnet selections so they only show up once.

<<<<<<< HEAD
>>>>>>> e4c85e87d... Added temp fix to allow display detailspanel
    return (
      API.all('functions')
=======
    return API.all('functions')
>>>>>>> 029975c87... Fix for displaying list of functions
=======
    console.log('Function Reader in the read service: ' + applicationName);

=======
>>>>>>> a4660ebe8... Added lambda as drop-down option when creating target group for an ALB
=======
>>>>>>> d088fd1bf... Fix linting issues
    return API.one('applications', applicationName)
      .all('functions')
>>>>>>> 69f7de598... Got application-function mapping working.
      .withParams({ region: 'us-west-2' })
      .getList()
      .then((functions: IFunctionSourceData[]) => {
        functions = this.functionTransformer.normalizeFunctionSet(functions);
        return this.$q.all(functions.map(fn => this.normalizeFunction(fn)));
      });
  }

  public getFunctionDetails(
    cloudProvider: string,
    account: string,
    region: string,
    name: string,
<<<<<<< HEAD
  ): IPromise<IFunctionSourceData[]> {
=======
  ): IPromise<IFunctionsSourceData[]> {
>>>>>>> e4c85e87d... Added temp fix to allow display detailspanel
    return API.all('functions')
      .withParams({ provider: cloudProvider, functionName: name, region: region, account: account })
      .get();
  }

  public listFunctions(cloudProvider: string): IPromise<IFunctionByAccount[]> {
    return API.all('functions')
      .withParams({ provider: cloudProvider })
      .getList();
  }

  private normalizeFunction(functionDef: IFunctionSourceData): IPromise<IFunction> {
    return this.functionTransformer.normalizeFunction(functionDef).then((fn: IFunction) => {
      // const nameParts: IComponentName = NameUtils.parseFunctionName(fn.name);
      // fn.name = nameParts.freeFormDetails
      fn.cloudProvider = fn.provider || fn.cloudProvider || 'aws';
      return fn;
    });
  }
}

export const FUNCTION_READ_SERVICE = 'spinnaker.core.function.read.service';

module(FUNCTION_READ_SERVICE, [require('./function.transformer').name]).service('functionReader', FunctionReader);
