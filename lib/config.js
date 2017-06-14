module.exports = {
  phraseappLocalesUrl: function (projectId) {
    return 'https://api.phraseapp.com/api/v2/projects/' + projectId + '/locales';
  },
  phraseappDownloadLocaleUrl: function (projectId, localeId, format) {
    return 'https://api.phraseapp.com/api/v2/projects/' + projectId + '/locales' + '/' + localeId + '/download?file_format=' + format;
  },
  phraseappFormatsUrl: function () {
    return 'https://api.phraseapp.com/api/v2/formats';
  }
}
