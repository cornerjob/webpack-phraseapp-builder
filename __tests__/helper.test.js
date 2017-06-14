var helper = require('../lib/helper.js');

jest.mock('request', function() {
  return function(options, cb) {
    if (options) {
      if (options.url === 'error') {
        cb('error', { statusCode: 400 }, null);
      }
      if (options.url === 'success') {
        cb(null, { statusCode: 200 }, '{"some":"text"}');
      }
    }
  }
});

describe('PhraseAppBuilderPlugin helper', function() {
  it('should exist', function() {
    expect(helper.getFormat).toBeDefined();
    expect(helper.phraseAppRequest).toBeDefined();
  });

  describe('getFormat function', function() {
    it('should return null if `projectId` is missed', function() {
      var expected = { api_name: 'json', extension: 'json' };
      var locales = [expected];
      var locale = 'json';

      expect(helper.getFormat(locales, locale)).toBe(expected);
    });
  });

  describe('phraseAppRequest function', function() {
    it('should return the given error', function() {
      var url = 'error';
      var accessToken = 'test';
      var result = helper.phraseAppRequest(url, accessToken);

      expect(result).rejects.toEqual(400);
    });

    it('should return the content', function() {
      var url = 'success';
      var accessToken = 'test';
      var result = helper.phraseAppRequest(url, accessToken);
      var expected = '{"some":"text"}';

      expect(result).resolves.toEqual(expected);
    });
  });
});
