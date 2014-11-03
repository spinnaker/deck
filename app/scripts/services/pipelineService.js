'use strict';


angular.module('deckApp')
  .factory('pipelineService', function() {

    function normalizePipelines(application) {
      var pipelines = {};
      application.pipelines.forEach(function(pipeline) {
        if (!pipelines.hasOwnProperty(pipeline.name)) {
          pipelines[pipeline.name] = [];
        }
        pipelines[pipeline.name].push(pipeline);
      });

      var pipelineExecutions = [];
      for (var pipelineName in pipelines) {
        var executions = pipelines[pipelineName];
        pipelineExecutions.push({ name: pipelineName, executions: executions.reverse() });
      }
      application.pipelines = pipelineExecutions;
    }

    return {
      normalizePipelines: normalizePipelines
    };

});
