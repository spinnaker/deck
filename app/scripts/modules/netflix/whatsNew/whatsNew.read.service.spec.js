'use strict';

import {NetflixSettings} from '../netflix.settings';

describe('Service: whatsNew reader ', function () {

  beforeEach(
    window.module(
      require('./whatsNew.read.service')
    )
  );

  beforeEach(window.inject(function(whatsNewReader, $httpBackend) {
    this.reader = whatsNewReader;
    this.$http = $httpBackend;
  }));

  describe('getContents', function() {

    beforeEach(function() {
      var gistId = NetflixSettings.whatsNew.gistId;
      this.url = ['https://api.github.com/gists/', gistId].join('');
    });

    it ('returns file contents with lastUpdated', function() {

      var result = null,
          response = {
            'updated_at': '1999',
            files: {},
          };

      response.files[NetflixSettings.whatsNew.fileName] = {
        content: 'expected content',
      };

      this.$http.expectGET(this.url).respond(200, response);

      this.reader.getWhatsNewContents().then(function(data) {
        result = data;
      });
      this.$http.flush();

      expect(result).not.toBeNull();
      expect(result.lastUpdated).toBe('1999');
      expect(result.contents).toBe('expected content');
    });

    it('returns null when gist fetch fails', function() {
      var result = 'fail';
      this.$http.expectGET(this.url).respond(404, {});
      this.reader.getWhatsNewContents().then(function(data) {
        result = data;
      });
      this.$http.flush();

      expect(result).toBeNull();
    });
  });
});
