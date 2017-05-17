import {mock, IHttpBackendService} from 'angular';
import {SETTINGS} from 'core/config/settings';
import {WHATS_NEW_READ_SERVICE, WhatsNewReader, IGistApiResponse, IWhatsNewContents} from './whatsNew.read.service';

describe('Service: whatsNew reader ', () => {
  let reader: WhatsNewReader;
  let $http: IHttpBackendService;

  beforeEach(
    mock.module(
      WHATS_NEW_READ_SERVICE
    )
  );

  beforeEach(mock.inject((whatsNewReader: WhatsNewReader, $httpBackend: IHttpBackendService) => {
    reader = whatsNewReader;
    $http = $httpBackend;
  }));

  beforeEach(() => { SETTINGS.changelog = { gistId: 'abc', fileName: 'log.md' }; });

  afterEach(SETTINGS.resetToOriginal);

  describe('getWhatsNewContents', () => {
    let url: string;
    beforeEach(() => {
      const gistId = SETTINGS.changelog.gistId;
      url = `https://api.github.com/gists/${gistId}`;
    });

    it ('returns file contents with lastUpdated', () => {
      let result: IWhatsNewContents = null;
      const response: IGistApiResponse = {
        'updated_at': '1999',
        files: {},
      };

      response.files[SETTINGS.changelog.fileName] = {
        content: 'expected content',
      };

      $http.expectGET(url).respond(200, response);

      reader.getWhatsNewContents().then((data: IWhatsNewContents) => result = data);
      $http.flush();

      expect(result).not.toBeNull();
      expect(result.lastUpdated).toBe('1999');
      expect(result.contents).toBe('expected content');
    });

    it('returns null when gist fetch fails', () => {
      let result: IWhatsNewContents = {contents: 'fail', lastUpdated: 'never'};
      $http.expectGET(url).respond(404, {});
      reader.getWhatsNewContents().then(function(data) {
        result = data;
      });
      $http.flush();

      expect(result).toBeNull();
    });
  });
});
