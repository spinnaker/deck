import {APPLICATION_DATA_SOURCE_REGISTRY} from './applicationDataSource.registry';
import {API_SERVICE} from 'core/api/api.service';
import {ApplicationDataSource, DataSourceConfig} from '../service/applicationDataSource';
import {Application} from '../application.model';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.applications.read.service', [
    require('../../scheduler/scheduler.factory.js'),
    API_SERVICE,
    APPLICATION_DATA_SOURCE_REGISTRY,
    require('../../presentation/robotToHumanFilter/robotToHuman.filter'),
  ])
  .factory('applicationReader', function ($q, $log, $filter, $http, settings, API, schedulerFactory,
                                          applicationDataSourceRegistry) {

    function listApplications() {
      return API.one('applications').useCache().get();
    }

    function getApplication(applicationName) {
      return $http.get([settings.gateUrl, 'applications', applicationName].join('/'))
        .then((response) => {
          let application = new Application(applicationName, schedulerFactory.createScheduler(), $q, $log);
          application.attributes = response.data.attributes;
          addDataSources(application);
          application.refresh();
          return application;
        });
    }

    function addDataSources(application) {
      let dataSources = applicationDataSourceRegistry.getDataSources();
      dataSources.forEach((ds) => {
        let dataSource = new ApplicationDataSource(new DataSourceConfig(ds), application, $q, $log, $filter);
        application.dataSources.push(dataSource);
        application[ds.key] = dataSource;
      });
      setDisabledDataSources(application);
    }

    function setDisabledDataSources(application) {
      let allDataSources = application.dataSources;
      if (!application.attributes.dataSources) {
        allDataSources
          .filter(ds => ds.optIn)
          .forEach(ds => disableDataSource(ds, allDataSources));
      } else {
        let appDataSources = application.attributes.dataSources;
        allDataSources.forEach(ds => {
          if (ds.optional) {
            if (ds.optIn && !appDataSources.enabled.includes(ds.key)) {
              disableDataSource(ds, allDataSources);
            }
            if (!ds.optIn && ds.optional && appDataSources.disabled.includes(ds.key)) {
              disableDataSource(ds, allDataSources);
            }
          }
        });
      }
    }

    function disableDataSource(dataSource, allDataSources) {
      dataSource.disabled = true;
      if (dataSource.badge) {
        allDataSources.find(test => test.key === dataSource.badge).disabled = true;
      }
    }

    return {
      listApplications: listApplications,
      getApplication: getApplication
    };
  });
