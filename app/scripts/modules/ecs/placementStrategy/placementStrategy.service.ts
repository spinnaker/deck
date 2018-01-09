import { module } from 'angular';

import { PlacementStrategy } from './PlacementStrategy';

export class PlacementStrategyService {

  public getPredefinedStrategy(strategyName: string): PlacementStrategy[] {
    if ( strategyName === 'AZ Balanced Spread' ) {
      return this.getAzBalancedSpreadStrategy();
    } else if ( strategyName === 'AZ Balanced BinPack' ) {
      return this.getAzBalancedBinPackStrategy();
    } else if ( strategyName === 'BinPack' ) {
      return this.getBinPackStrategy();
    } else if ( strategyName === 'One Task Per Host' ) {
      return this.getOneTaskPerHostStrategy();
    } else {
      // TODO: Add support for custom placement strategy.
      return [];
    }
  }

  public getAzBalancedSpreadStrategy(): PlacementStrategy[] {
    return [
      { type: 'spread', field: 'attribute:ecs.availability-zone' },
      { type: 'spread', field: 'instanceId' }
    ];
  }

  public getAzBalancedBinPackStrategy(): PlacementStrategy[] {
    return [
      { type: 'spread', field: 'attribute:ecs.availability-zone' },
      { type: 'binpack', field: 'memory' }
    ];
  }

  public getBinPackStrategy(): PlacementStrategy[] {
    return [
      { type: 'binpack', field: 'memory' }
    ];
  }

  public getOneTaskPerHostStrategy(): PlacementStrategy[] {
    return [
      { type: 'spread', field: 'instanceId' }
    ];
  }
}


export const PLACEMENT_STRATEGY_SERVICE = 'spinnaker.ecs.placementStrategyService.service';

module(PLACEMENT_STRATEGY_SERVICE, []).service('placementStrategyService', PlacementStrategyService);
