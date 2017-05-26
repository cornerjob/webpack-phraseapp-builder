var helper = require('./helper');

function PhraseAppBuilderPlugin(options) {
  this.pharseAppOptions = Object.assign({}, {
    localesId: [],
    accessToken: null,
    projectId: null,
    format: 'json'
  }, options || {});
}

PhraseAppBuilderPlugin.prototype.apply = function(compiler) {
  var options = this.pharseAppOptions;

  compiler.plugin('emit', function(compilation, callback) {
    var accessToken = options.accessToken;
    var localesId = options.localesId;

    if (!localesId.length || !accessToken || !options.projectId) callback();


    var requestChain = localesId.reduce(function(accumulator, localeId) {
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

            compilation.assets[fileName] = {
              source: function() {
                return content;
              },
              size: function() {
                return content.length;
              }
            };
          });
        })
        .catch(function(statusCode) {
          console.log('Error: PharseApp API returned status code: ' + statusCode + ' for request with locale ' + localeId);
        });
    }, Promise.resolve());

    requestChain
    .then(function() {
      callback();
    });
  });
};

module.exports = PhraseAppBuilderPlugin;
