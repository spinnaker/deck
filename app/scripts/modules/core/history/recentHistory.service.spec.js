import _ from 'lodash';

describe('recent history service', function() {

  var service, deckCacheFactory, backingCache;

  beforeEach(
    window.module(
      require('./recentHistory.service.js')
    )
  );

  beforeEach(window.inject((recentHistoryService, _deckCacheFactory_) => {
    service = recentHistoryService;
    deckCacheFactory = _deckCacheFactory_;
    deckCacheFactory.clearCache('history', 'user');
    backingCache = deckCacheFactory.getCache('history', 'user');
  }));

  describe('getItems returns items most recent first', () => {

    it('returns an empty list if none found', () => {
      expect(service.getItems('something')).toEqual([]);
    });

    it('returns whatever is in cache if something is found, ordered by accessTime', () => {
      backingCache.put('whatever', [{accessTime: 1}, {accessTime: 3}, {accessTime: 2}]);
      expect(service.getItems('whatever').map((item) => { return item.accessTime; })).toEqual([3, 2, 1]);
    });
  });

  describe('addItem is fancy', () => {

    function initializeCache(count) {
      let start = new Date().getTime() - 1;
      let currentItems = _.range(0, count).map((idx) => {
        return { params: {id: idx}, accessTime: start - idx};
      });
      backingCache.put('whatever', currentItems);
    }

    it('puts items in cache most recent first', () => {
      initializeCache(2);
      service.addItem('whatever', 'state', {id: 'new item'});
      let ids = service.getItems('whatever').map((item) => { return item.params.id; });
      expect(ids).toEqual(['new item', 0, 1]);
    });

    it('replaces oldest item if cache is full', () => {
      initializeCache(15);
      service.addItem('whatever', 'state', {id: 'new item'});
      let ids = service.getItems('whatever').map((item) => { return item.params.id; });
      expect(ids).toEqual(['new item', 0, 1, 2, 3]);
    });

    it('removes previous entry and adds replacement if params match', () => {
      initializeCache(3);
      service.addItem('whatever', 'state', {id: 1});
      let ids = service.getItems('whatever').map((item) => { return item.params.id; });
      expect(ids).toEqual([1, 0, 2]);
    });

    it('only matches on specified params if supplied', () => {
      let start = new Date().getTime() - 1;
      let currentItems = _.range(0, 3).map((idx) => {
        return { params: {id: idx, importantParam: idx, ignoredParam: idx + 1}, accessTime: start - idx};
      });
      backingCache.put('whatever', currentItems);
      service.addItem('whatever', 'state', {id: 1, importantParam: 1, ignoredParam: 1000}, ['importantParam', 'id']);
      let ids = service.getItems('whatever').map((item) => { return item.params.id; });
      expect(ids).toEqual([1, 0, 2]);
      service.addItem('whatever', 'state', {id: 1, importantParam: 1, ignoredParam: 1001}, ['ignoredParam']);
      ids = service.getItems('whatever').map((item) => { return item.params.id; });
      expect(ids).toEqual([1, 1, 0, 2]);
    });
  });

  describe('remove item from history cache by app name', function () {
    beforeEach(
      function initilizeCache() {
        let start = new Date().getTime() - 1;
        let currentItems = ['foo', 'bar', 'baz'].map((appName, index) => {
          return { params: {application: appName, accessTime: start - index}};
        });
        backingCache.put('applications', currentItems);
      }
    );

    it('should have 3 items in the "applications" cache', function () {
      let items = service.getItems('applications');
      expect(items.length).toBe(3);
    });

    it('should have 2 items in the "application" cache when we remove "foo" by application name', function () {
      service.removeByAppName('foo');
      let items = service.getItems('applications');
      expect(items.length).toBe(2);
      expect(_.some(items, {params: {application: 'foo'}})).toBeFalsy();
    });
  });

});
