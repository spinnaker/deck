'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.netflix.alert.handler', [
    require('../../core/config/settings.js'),
    require('../../core/authentication/authentication.service.js'),
  ])
  .config(function ($provide) {
    $provide.decorator('$exceptionHandler', function($delegate, settings, authenticationService, $, $log) {
      let currentVersion = require('../../../../../version.json');

      return function(exception, cause) {
        $delegate(exception, cause);
        if (!settings.alert) {
          return;
        }
        let message = exception.message;
        if (!message) {
          try {
            message = JSON.stringify(exception);
          } catch (e) {
            message = '[No message available - could not convert exception to JSON string]';
          }
        }
        let payload = {
          alertName: 'Spinnaker',
          details: {
            url: location.href,
            user: authenticationService.getAuthenticatedUser().name,
            version: currentVersion.version,
          },
          exception: {
            classes: [exception.name || '[no name on exception]'],
            messages: [message],
            stackTraces: [exception.stack || '[no stacktrace available]'],
            callerClass: 'Spinnaker',
            callerMethod: '[see stack trace]',
          },
          actions: [
            {
              action: 'email',
              suppressTimeSecs: settings.alert.throttleInSeconds,
              to: settings.alert.recipients,
              subject: settings.alert.subject || '[Spinnaker] Error in Deck',
              htmlTemplate: settings.alert.template || 'spinnaker_deck_error',
              incidentKey: exception.message,
            }
          ],
        };
        if (navigator.sendBeacon) {
          navigator.sendBeacon(settings.alert.url, JSON.stringify(payload));
        } else {
          $log.warn('no beacon support :(');
          $.post(settings.alert.url, JSON.stringify(payload));
        }
      };
    });
  });
