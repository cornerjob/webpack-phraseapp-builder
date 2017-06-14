var config = require('../lib/config.js');

describe('Config', function() {
  it('should return the `phraseappLocalesUrl`', function() {
    var projectId = 'test';
    var expected = 'https://api.phraseapp.com/api/v2/projects/' + projectId + '/locales';

    expect(config.phraseappLocalesUrl(projectId)).toBe(expected);
  });

  it('should return the `phraseappDownloadLocaleUrl`', function() {
    var projectId = 'test1';
    var localeId = 'test2';
    var format = 'test3';
    var expected = 'https://api.phraseapp.com/api/v2/projects/' + projectId + '/locales' + '/' + localeId + '/download?file_format=' + format;

    expect(config.phraseappDownloadLocaleUrl(projectId, localeId, format)).toBe(expected);
  });

  it('should return the `phraseappFormatsUrl`', function() {
    var expected = 'https://api.phraseapp.com/api/v2/formats';

    expect(config.phraseappFormatsUrl()).toBe(expected);
  });
});
