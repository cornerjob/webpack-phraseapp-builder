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

    var requestPromises = localesId.map(function(localeId) {
      var parameters = {
        projectId: options.projectId,
        localeId: localeId,
        format: options.format
      };

      var url = helper.buildEndPoint(parameters);

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
        })
        .catch(function() {
          console.log('Could not process the request: ' + url);
        });
    });

    var result = Promise.all(requestPromises);

    result
    .then(function() {
      callback();
    });
  });
};

module.exports = PhraseAppBuilderPlugin;
