var request = require('request');
var config = require('./config');

function buildEndPoint(args) {
  var projectId = (args && args.projectId) || null;
  var localeId = (args && args.localeId) || null;
  var format = (args && args.format) || null;

  if (!projectId  || !localeId || !format) return null;

  var url = config.domain + config.version + '/projects/' + projectId + '/locales/' + localeId + '/download?file_format=' + format;

  return url;
}

function phraseAppRequest(url, accessToken) {
  return new Promise(function(resolve, reject) {
    var headers = {
      'Authorization': 'token ' + accessToken
    };

    var options = {
      url: url,
      headers: headers
    };

    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var fileName = response.headers['content-disposition'].split('"')[1];

        resolve({
          content: body,
          fileName: fileName
        });
      } else {
        reject((response && response.statusCode) || 503);
      }
    });
  });
}

module.exports = {
  buildEndPoint: buildEndPoint,
  phraseAppRequest: phraseAppRequest
}
