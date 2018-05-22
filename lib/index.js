var helper = require('./helper');
var config = require('./config');
var fs = require('fs');
var path = require('path');

function PhraseAppBuilderPlugin(options) {
  this.cache = [];
  this.pharseAppOptions = Object.assign({}, {
    accessToken: null,
    projectId: null,
    outputPath: null,
    format: 'json'
  }, options || {});
}

PhraseAppBuilderPlugin.prototype.apply = function(compiler) {
  var options = this.pharseAppOptions;
  var ref = this;

  var cycleEvent = function(compilation, cb) {
    if (ref.done) return cb();

    var accessToken = options.accessToken;
    var outputPath = options.outputPath;
    var api_format = options.format;

    if (!accessToken || !options.projectId) return cb();

    if (!fs.existsSync(outputPath)) {
      if (typeof outputPath === 'string') {
        fs.mkdirSync(outputPath);
      } else {
        return cb();
      }
    }

    var formatsUrl = config.phraseappFormatsUrl();
    var localesUrl = config.phraseappLocalesUrl(options.projectId);

    var promises = Promise.all([
      helper.phraseAppRequest(formatsUrl, accessToken),
      helper.phraseAppRequest(localesUrl, accessToken)
    ]);

    return promises
      .then(function([formats, locales]) {
        var format = helper.getFormat(JSON.parse(formats), api_format);
        return {
          format: format,
          locales: JSON.parse(locales)
        }
      })
      .catch(function(statusCode) {
        console.error('Error: PhraseApp API returned status code: ' + statusCode);
        cb();
      })
      .then(function(data) {
        if (!data) return;

        var format = data.format;
        var locales = data.locales;

        return locales.reduce(function(accumulator, locale) {
          var url = config.phraseappDownloadLocaleUrl(options.projectId, locale.id, format.api_name);

          return accumulator.then(function() {
            return helper.phraseAppRequest(url, accessToken)
              .then(function(body) {
                var content = body;
                var fileName = locale.name + '.' + format.extension;
                var file = path.join(outputPath, fileName);

                fs.writeFile(file, content, function(error) {
                  if (error) {
                    console.error('could not create the translation file: ' + fileName);
                  }
                });
              });
            })
            .catch(function(statusCode) {
              console.error('Error: PhraseApp API returned status code: ' + statusCode + ' for request with locale ' + locale.id);
            });
        }, Promise.resolve());
      })
      .then(function() {
        ref.done = true;
        cb();
      })
      .catch(function(error) {
        console.error('Error: ', error);
        cb();
      });
  };

  compiler.plugin('watch-run', cycleEvent);
  compiler.plugin('run', cycleEvent);
};

module.exports = PhraseAppBuilderPlugin;
