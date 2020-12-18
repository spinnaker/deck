export interface IEcsDescribeCluster {
  activeServicesCount : number,
  attachments : IDescribeClusterAttachments,
  attachmentsStatus : string,
  capacityProviders : string[],
  clusterArn : string,
  clusterName : string,
  defaultCapacityProviderStrategy : IDescribeClusterDefaultCapacityProviderStrategy[],
  pendingTasksCount : number,
  registeredContainerInstancesCount : number,
  runningTasksCount : number,
  settings : IDescribeClusterSettings[],
  statistics : IDescribeClusterStatistics[],
  status : string,
  tags : IDescribeClusterTags[],
  failures: IDescribeClusterFailures[]


}

export interface IDescribeClusterAttachments {
  details : IDescribeClusterAttachmentDetails[],
  id : string,
  Status : string,
  type : string
}

export interface IDescribeClusterAttachmentDetails {
  name : string,
  value : string
}

export interface IDescribeClusterDefaultCapacityProviderStrategy {
  base : number,
  capacityProvider : string,
  weight : number
}

export interface IDescribeClusterSettings {
  name : string,
  value : string
}

export interface IDescribeClusterStatistics {
  name : string,
  value : string
}

export interface IDescribeClusterTags {
  key : string,
  value : string
}

export interface IDescribeClusterFailures {
  arn : string,
  detail : string,
  reason : string
}
