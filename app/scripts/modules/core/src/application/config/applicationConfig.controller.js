import { cloneDeep } from 'lodash';

import { APPLICATION_DATA_SOURCE_EDITOR } from './dataSources/applicationDataSourceEditor.component';
import { CHAOS_MONKEY_CONFIG_COMPONENT } from 'core/chaosMonkey/chaosMonkeyConfig.component';
import { TRAFFIC_GUARD_CONFIG_COMPONENT } from './trafficGuard/trafficGuardConfig.component';
import { SETTINGS } from 'core/config/settings';
import { ApplicationWriter } from 'core/application/service/ApplicationWriter';
import { ManagedReader } from 'core/managed';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.core.application.config.controller', [
    require('@uirouter/angularjs').default,
    require('./applicationAttributes.directive').name,
    require('./applicationNotifications.directive').name,
    require('./deleteApplicationSection.directive').name,
    require('./applicationSnapshotSection.component').name,
    APPLICATION_DATA_SOURCE_EDITOR,
    CHAOS_MONKEY_CONFIG_COMPONENT,
    TRAFFIC_GUARD_CONFIG_COMPONENT,
    require('./links/applicationLinks.component').name,
  ])
  .controller('ApplicationConfigController', [
    '$state',
    'app',
    '$scope',
    function($state, app, $scope) {
      this.application = app;
      this.isDataSourceEnabled = key => app.dataSources.some(ds => ds.key === key && ds.disabled === false);
      this.feature = SETTINGS.feature;
      if (app.notFound) {
        $state.go('home.infrastructure', null, { location: 'replace' });
      } else {
        this.application.attributes.instancePort =
          this.application.attributes.instancePort || SETTINGS.defaultInstancePort || null;
      }
      this.bannerConfigProps = {
        isSaving: false,
        saveError: false,
      };
      this.updateBannerConfigs = bannerConfigs => {
        const applicationAttributes = cloneDeep(this.application.attributes);
        applicationAttributes.customBanners = bannerConfigs;
        $scope.$applyAsync(() => {
          this.bannerConfigProps.isSaving = true;
          this.bannerConfigProps.saveError = false;
        });
        ApplicationWriter.updateApplication(applicationAttributes)
          .then(() => {
            $scope.$applyAsync(() => {
              this.bannerConfigProps.isSaving = false;
              this.application.attributes = applicationAttributes;
            });
          })
          .catch(() => {
            this.bannerConfigProps.isSaving = false;
            this.bannerConfigProps.saveError = true;
          });
      };

      this.notifications = [];
      this.updateNotifications = notifications => {
        $scope.$applyAsync(() => {
          this.notifications = notifications;
        });
      };

      if (this.feature.managedResources) {
        this.hasManagedResources = false;
        ManagedReader.getApplicationSummary(this.application.name).then(({ hasManagedResources }) => {
          $scope.$applyAsync(() => {
            this.hasManagedResources = hasManagedResources;
          });
        });
      }
    },
  ]);
