'use strict';

angular.module('deckApp')
  .constant('settings', {
    front50Url: 'http://front50-prestaging.prod.netflix.net',
    oortUrl: 'http://oort-prestaging.prod.netflix.net',
    mortUrl: 'http://mort-prestaging.prod.netflix.net',
    pondUrl: 'http://pond-prestaging.prod.netflix.net',
    katoUrl: 'http://kato-prestaging.prod.netflix.net',
    credentialsUrl: 'http://kato-prestaging.prod.netflix.net/',
    accounts: {
      prod: {
        challengeDestructiveActions: true
      }
    },
    pollSchedule: 30000,
    providers: ['aws']
  });
