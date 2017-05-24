var helper = require('../lib/helper.js');

jest.mock('request', function() {
  return function(options, cb) {
    if (options) {
      if (options.url === 'error') {
        cb('error', null, null);
      }
      if (options.url === 'success') {
        var response = {
          statusCode: 200,
          headers: {
            'content-disposition': 'attachment; filename="es.json"'
          }
        }
        cb(null, response, '{"some":"text"}');
      }
    }
  }
});

describe('PhraseAppBuilderPlugin helper', function() {
  it('should exist', function() {
    expect(helper.buildEndPoint).toBeDefined();
    expect(helper.phraseAppRequest).toBeDefined();
  });

  describe('buildEndPoint function', function() {
    it('should return null if `projectId` is missed', function() {
      var result1 = helper.buildEndPoint({ localeId: 'test', format: 'json' });
      var result2 = helper.buildEndPoint({ projectId: 'test', format: 'json' });
      var result3 = helper.buildEndPoint({ projectId: 'test', localeId: 'test' });

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });

    it('should return a well formed url', function() {
      var options = {
        projectId: 'testProjectId',
        localeId: 'testLocaleId',
        format: 'json'
      };
      var result = helper.buildEndPoint(options);
      var expected = 'https://api.phraseapp.com/api/v2/projects/testProjectId/locales/testLocaleId/download?file_format=json';

      expect(result).toEqual(expected);
    });
  });

  describe('phraseAppRequest function', function() {
    it('should return the given error', function() {
      var url = 'error';
      var accessToken = 'test';
      var result = helper.phraseAppRequest(url, accessToken);

      expect(result).rejects.toEqual('error');
    });

    it('should return the content and the fileName', function() {
      var url = 'success';
      var accessToken = 'test';
      var result = helper.phraseAppRequest(url, accessToken);
      var expected = {
        content: '{"some":"text"}',
        fileName: 'es.json'
      };

      expect(result).resolves.toEqual(expected);
    });
  });
});
