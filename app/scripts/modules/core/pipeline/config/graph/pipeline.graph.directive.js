'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.config.graph.directive', [
  require('../../../utils/d3.js'),
  require('../../../utils/lodash.js'),
  require('../../../utils/jQuery.js'),
])
  .directive('pipelineGraph', function ($window, d3Service, _, $) {
    return {
      restrict: 'E',
      scope: {
        pipeline: '=',
        viewState: '=',
        onNodeClick: '=',
      },
      templateUrl: require('./pipelineGraph.directive.html'),
      link: function (scope, elem) {

        var minLabelWidth = 100;

        scope.nodeRadius = 8;
        scope.rowPadding = 30;
        scope.graphVerticalPadding = 15;
        scope.labelOffsetX = scope.nodeRadius + 3;
        scope.labelOffsetY = scope.nodeRadius + 10;

        /**
         * Used to draw inverse bezier curve between stages
         */
        var diagonal = d3Service.svg.diagonal()
          .source(function(d) { return {'x': d.source.y, 'y': d.source.x + scope.nodeRadius}; })
          .target(function(d) { return {'x': d.target.y, 'y': d.target.x - scope.nodeRadius}; })
          .projection(function (d) {
            return [d.y, d.x];
          });


        scope.nodeClicked = function(node) {
          scope.onNodeClick(node.section, node.index);
        };

        scope.highlight = function(node) {
          if (node.isActive) {
            return;
          }
          node.isHighlighted = true;
          node.parentLinks.forEach(function(link) {
            link.isHighlighted = true;
            link.className = 'highlighted target';
          });
          node.childLinks.forEach(function(link) {
            link.isHighlighted = true;
            link.className = 'highlighted source';
          });
        };

        scope.removeHighlight = function(node) {
          if (node.isActive) {
            return;
          }
          node.isHighlighted = false;
          node.parentLinks.forEach(function(link) {
            link.isHighlighted = false;
            link.className = link.parent.isActive ? 'active source' : 'inactive';
          });
          node.childLinks.forEach(function(link) {
            link.isHighlighted = false;
            link.className = link.child.isActive ? 'active target' : 'inactive';
          });
        };

        /**
         * Creates base configuration for all nodes;
         *  - does not set phase, position, or create links between nodes
         */
        function createNodes() {
          var configNode = {
              name: 'Configuration',
              phase: 0,
              id: -1,
              section: 'triggers',
              parentIds: [],
              parents: [],
              children: [],
              parentLinks: [],
              childLinks: [],
              root: true,
              isActive: scope.viewState.section === 'triggers',
              isHighlighted: false,
            },
            nodes = [configNode];

          scope.pipeline.stages.forEach(function(stage, idx) {
            var node = {
              id: stage.refId,
              name: stage.name || '[new stage]',
              section: 'stage',
              index: idx,
              parentIds: angular.copy(stage.requisiteStageRefIds || []),
              parents: [],
              children: [],
              parentLinks: [],
              childLinks: [],
              isActive: scope.viewState.stageIndex === idx && scope.viewState.section === 'stage',
              isHighlighted: false,
            };
            if (!node.parentIds.length) {
              node.parentIds.push(configNode.id);
            }
            nodes.push(node);
          });
          return nodes;
        }

        /**
         * Sets phases and adds children/parents to nodes
         * Probably blows the stack if circular dependencies exist, maybe not
         */
        function applyPhasesAndLink(nodes) {
          nodes = nodes || createNodes();
          var allPhasesResolved = true;
          nodes.forEach(function(node) {
            var phaseResolvable = true,
                phase = 0;
            if (!node.parentIds.length) {
              node.phase = phase;
            } else {
              node.parentIds.forEach(function(parentId) {
                var parent = _.find(nodes, { id: parentId });
                if (parent.phase === undefined) {
                  phaseResolvable = false;
                } else {
                  phase = Math.max(phase, parent.phase);
                  parent.children.push(node);
                  node.parents.push(parent);
                }
              });
              if (phaseResolvable) {
                node.phase = phase + 1;
              } else {
                allPhasesResolved = false;
              }
            }
          });
          if (!allPhasesResolved) {
            applyPhasesAndLink(nodes);
          } else {
            scope.phaseCount = _.max(nodes, 'phase').phase;
            if (scope.phaseCount > 6) {
              scope.nodeRadius = 6;
              scope.labelOffsetX = scope.nodeRadius + 3;
              scope.labelOffsetY = 15;
            }
            scope.nodes = [];
            nodes.forEach(function(node) {
              node.children = _.uniq(node.children);
              node.parents = _.uniq(node.parents);
              node.leaf = node.children.length === 0;
            });

            var grouped = _.groupBy(nodes, 'phase');

            // Collision minimization "Algorithm"
            _.forOwn(grouped, function(group, phase) {
              var sortedPhase = _.sortByAll(group,
                // farthest, highest parent, e.g. phase 1 always before phase 2, row 1 always before row 2
                function(node) {
                  if (node.parents.length) {
                    var parents = _.sortByAll(node.parents,
                      function(parent) {
                        return 1 - parent.phase;
                      },
                      function(parent) {
                        return parent.row;
                      });

                    var firstParent = parents[0];
                    return (firstParent.phase * 100) + firstParent.row;
                  }
                  return 0;
                },
                // same highest parent, so sort by number of children (more first)
                function(node) {
                  return 1 - node.children.length;
                },
                // same number of children, so sort by number of grandchildren (more first)
                function(node) {
                  return 1 - _.sum(node.children, function(child) { return child.children.length; });
                },
                // great, same number of grandchildren, how about by nearest children, alphabetically by name, why not
                function(node) {
                  return _.sortBy(node.children, 'phase').map(function(child) {
                    return [(child.phase - node.phase), child.name].join('-');
                  }).join(':');
                },
                function(node) {
                  return parseInt(node.id);
                }
              );
              sortedPhase.forEach(function(node, index) { node.row = index; });
              scope.nodes[phase] = sortedPhase;
            });
          }
        }

        /**
         * Sets the width of the graph and determines the width available for each label
         */
        function applyPhaseWidth() {
          var graphWidth = elem.width() - (2 * scope.nodeRadius);
          var phaseOffset = 2*scope.nodeRadius + scope.labelOffsetX;
          var maxLabelWidth = graphWidth;

          if (scope.phaseCount) {
            maxLabelWidth = (graphWidth / (scope.phaseCount + 1)) - phaseOffset;
          }
          maxLabelWidth = Math.max(minLabelWidth, maxLabelWidth);
          scope.maxLabelWidth = maxLabelWidth;
          if (maxLabelWidth === minLabelWidth) {
            scope.graphWidth = (scope.phaseCount + 1) * (maxLabelWidth + phaseOffset) + 5 + 'px';
            scope.graphClass = 'small';
          } else {
            scope.graphWidth = '100%';
            scope.graphClass = '';
          }
        }

        function applyNodeHeights() {
          var placeholderNode = elem.find('g.placeholder div');
          placeholderNode.width(scope.maxLabelWidth);
          scope.graphHeight = 0;
          scope.nodes.forEach(function(nodes) {
            nodes.forEach(function(node) {
              placeholderNode.html('<a href>' + node.name + '</a>');
              node.height = placeholderNode.height() + scope.rowPadding;
            });
            scope.graphHeight = Math.max(_.sum(nodes, 'height'), scope.graphHeight);
          });
          placeholderNode.empty();
          scope.graphHeight += 3*scope.graphVerticalPadding;
        }

        function setNodePositions() {
          scope.nodes.forEach(function(nodes, idx) {
            var nodeOffset = scope.graphVerticalPadding;
            nodes.forEach(function(node, rowNumber) {
              node.x = (scope.maxLabelWidth + 2*scope.nodeRadius + scope.labelOffsetX) * idx;
              node.y = nodeOffset;
              nodeOffset += scope.rowHeights[rowNumber];
            });
          });
        }

        function createLinks() {
          scope.nodes.forEach(function(column) {
            column.forEach(function(node) {
              node.children.forEach(function(child) {
                var linkClass = node.isActive ? 'active source' :
                  child.isActive ? 'active target' : 'inactive';
                var link = {
                  parent: node,
                  child: child,
                  className: linkClass,
                  line: diagonal({ source: node, target: child })
                };
                node.childLinks.push(link);
                child.parentLinks.push(link);
              });
            });
          });
        }

        function applyAllNodes() {
          var flattened = _.flatten(scope.nodes),
            highlighted = _.find(flattened, 'isHighlighted'),
            active = _.find(flattened, 'isActive'),
            base = _.filter(flattened, {isActive: false, isHighlighted: false});

          scope.allNodes = base;
          if (highlighted) {
            base.push(highlighted);
          }
          if (active) {
            base.push(active);
          }
        }

        function establishRowHeights() {
          var rowHeights = [];
          scope.nodes.forEach(function(column) {
            column.forEach(function(node, rowNumber) {
              if (!rowHeights[rowNumber]) {
                rowHeights[rowNumber] = 0;
              }
              rowHeights[rowNumber] = Math.max(rowHeights[rowNumber], node.height);
            });
          });
          scope.rowHeights = rowHeights;
          scope.graphHeight = _.sum(scope.rowHeights) + 2*scope.graphVerticalPadding;
        }


        function updateGraph() {
          applyPhasesAndLink();
          applyPhaseWidth();
          applyNodeHeights();
          establishRowHeights();
          setNodePositions();
          createLinks();
          applyAllNodes();

        }

        var handleWindowResize = _.throttle(function() {
          scope.$evalAsync(updateGraph);
        }, 300);

        updateGraph();

        scope.$watch('pipeline', updateGraph, true);
        scope.$watch('viewState', updateGraph, true);
        $($window).bind('resize.pipelineGraph-' + scope.pipeline.id, handleWindowResize);

        scope.$on('$destroy', function() {
          $($window).unbind('resize.pipelineGraph-' + scope.pipeline.id);
        });

      },
    };
  });
