var request = require('request');
var config = require('./config');

function getFormat(formats, format) {
  return formats.filter(function(item) {
    return item.api_name === format;
  }).shift();
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
        resolve(body);
      } else {
        reject((response && response.statusCode) || 503);
      }
    });
  });
}

module.exports = {
  getFormat: getFormat,
  phraseAppRequest: phraseAppRequest
}
