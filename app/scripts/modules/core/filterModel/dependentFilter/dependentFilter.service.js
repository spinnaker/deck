'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.core.filterModel.dependentFilter.service', [
  require('../../utils/lodash.js')
])
  .factory('dependentFilterService', function (_) {

    // Dependencies must be ordered from top-level parent to bottom-level child and cannot branch.
    function digestDependentFilters({ dependencies, sortFilter }) {
      let headings = dependencies.reduce(generateIterator(sortFilter), {});
      handleTail(_.last(dependencies).child, sortFilter, headings);

      return headings;
    }

    function generateIterator(sortFilter) {
      return function iterator(headings, { child, parent, childKeyedByParent }) {
        let staleSelectedParents = mapTruthyHashKeysToList(sortFilter[parent]);
        // headings[parent] will be undefined for head of chain, but all headings are available.
        let availableParents = headings[parent] || mapTruthyHashKeysToList(childKeyedByParent);

        unselectDifference(staleSelectedParents, availableParents, sortFilter[parent]);
        let selectedParents = mapTruthyHashKeysToList(sortFilter[parent]);

        let parents = getParents(availableParents, selectedParents);
        headings[child] = getChildHeadings(parents, childKeyedByParent);

        return headings;
      };
    }

    function handleTail(lastChild, sortFilter, headings) {
      let selectedLastChildren = mapTruthyHashKeysToList(sortFilter[lastChild]);
      unselectDifference(selectedLastChildren, headings[lastChild], sortFilter[lastChild]);
    }

    function getParents(availableParents, selectedParents) {
      if (selectedParents.length) {
        return _.intersection(availableParents, selectedParents);
      }
      return availableParents;
    }

    function getChildHeadings(parents, childKeyedByParent) {
      return _(parents)
        .map(parent => childKeyedByParent[parent])
        .flatten()
        .uniq()
        .valueOf();
    }

    function mapTruthyHashKeysToList(hash) {
      return Object.keys(_.pick(hash, _.identity));
    }

    function unselectDifference(selected, available, selectedHash) {
      _.difference(selected, available)
        .forEach(toUnselect => delete selectedHash[toUnselect]);
    }

    return { digestDependentFilters };
  });
