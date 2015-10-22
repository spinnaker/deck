"use strict";

const angular = require("angular");

module.exports = angular.module("spinnaker.netflix.bakery", [])
  .provider("bakeryProvider", function() {
    var detailUrl = null;
    this.$get = function() {
      return {
        getDetailUrl() {
          if (detailUrl === null) {
            throw ("Bakery detail url not set. Set with bakeryProvider#setDetailUrl");
          }
          return detailUrl;
        },
        setDetail(url) {
          detailUrl = url;
        }
      };
    };
  })
  .name;