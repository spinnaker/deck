export interface IEcsCapacityProvidersDetails {
  capacityProviders : string[],
  clusterName : string,
  defaultCapacityProviderStrategy : IEcsDefaultCapacityProviderStrategyItem[],
}

export interface IEcsDefaultCapacityProviderStrategyItem {
  base : number,
  capacityProvider : string,
  weight : number
}
