const angular = require("angular");

module.exports = angular.module("spinnaker.core.deploymentStrategy.strategies", [
  require("./highlander"),
  require("./none"),
  require("./redblack"),
  require("./rollingPush"),
]);
