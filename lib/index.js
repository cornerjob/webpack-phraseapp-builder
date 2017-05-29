var helper = require('./helper');
var fs = require('fs');
var path = require('path');

function PhraseAppBuilderPlugin(options) {
  this.cache = [];
  this.pharseAppOptions = Object.assign({}, {
    localesId: [],
    accessToken: null,
    projectId: null,
    outputPath: null,
    format: 'json'
  }, options || {});
}

PhraseAppBuilderPlugin.prototype.apply = function(compiler) {
  var options = this.pharseAppOptions;
  var ref = this;

  var cycleEvent = function(compilation, callback) {
    var accessToken = options.accessToken;
    var localesId = options.localesId;
    var outputPath = options.outputPath;

    if (!localesId.length || !accessToken || !options.projectId) callback();

    if (!fs.existsSync(outputPath)) {
      console.error('The path `' + outputPath + '` does not exist');
      callback();
    }

    var requestChain = localesId.reduce(function(accumulator, localeId) {
      if (ref.cache.indexOf(localeId) !== -1) return Promise.resolve();

      var parameters = {
        projectId: options.projectId,
        localeId: localeId,
        format: options.format
      };

      var url = helper.buildEndPoint(parameters);

      return accumulator.then(function() {
        return helper.phraseAppRequest(url, accessToken)
          .then(function(data) {
            var content = data.content;
            var fileName = data.fileName;
            var file = path.join(outputPath, fileName);

            fs.writeFile(file, content, function(error) {
              if (error) {
                console.error('could not create the translation file: ' + fileName);
              } else {
                if (ref.cache.indexOf(localeId) === -1) ref.cache.push(localeId);
              }
            });
          });
        })
        .catch(function(statusCode) {
          console.error('Error: PharseApp API returned status code: ' + statusCode + ' for request with locale ' + localeId);
        });
    }, Promise.resolve());

    requestChain
      .then(function() {
        callback();
      })
      .catch(function(error) {
        console.error('Error: ', error);
      });
  };

  compiler.plugin('watch-run', cycleEvent);
  compiler.plugin('run', cycleEvent);
};

module.exports = PhraseAppBuilderPlugin;
