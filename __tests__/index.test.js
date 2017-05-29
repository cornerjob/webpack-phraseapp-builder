var path = require('path');
var MemoryFileSystem = require('memory-fs');
var fs = require('fs');

var webpack = require('webpack');

var PhraseAppBuilderPlugin = require('../index.js');

var OUTPUT_DIR = path.resolve(__dirname, './dist');
var fileName = 'es.json';

// Webpack configuration

function webpackConfig (pluginOptions) {
  return {
    entry: {
      app: path.join(__dirname, './entry.js')
    },
    output: {
      path: OUTPUT_DIR,
      filename: '[name].js'
    },
    plugins: [
      new PhraseAppBuilderPlugin(pluginOptions)
    ]
  };
}

// Webpack compiler

function webpackCompile(options, callback) {
  var config = webpackConfig(options);

  var compiler = webpack(config);

  compiler.outputFileSystem = new MemoryFileSystem();

  compiler.run(function(err, stats){
    expect(err).toBeFalsy();
    expect(stats.hasErrors()).toBe(false);

    callback(stats);
  })
}

// Mock helper

jest.mock('../lib/helper', function () {
  return {
    buildEndPoint: function (url){
      return url.localeId;
    },
    phraseAppRequest: function(url) {
      if (url !== 'error') {
        return Promise.resolve({
          content: '{ "some": "text" }',
          fileName: url === 'id2' ? 'en.json' : 'es.json'
        });
      } else {
        return Promise.reject(400);
      }
    }
  }
});

describe('PhraseAppBuilderPlugin', function() {
  var pluginOptions;

  beforeEach(function() {
    pluginOptions = {
      localesId: ['testId'],
      accessToken: 'testAccessToken',
      projectId: 'testProjectId',
      outputPath: __dirname,
      format: 'json'
    };
  });

  it('should exist', function() {
    expect(PhraseAppBuilderPlugin).toBeDefined();
  });

  it('should download the translations in the specified path', function(done) {
    pluginOptions['outputPath'] = __dirname;

    webpackCompile(pluginOptions, function(stats) {
      expect(fs.existsSync(path.resolve(__dirname, './es.json'))).toBe(true);
      done();
    });
  });

  it('should not break the entry point compilation', function(done) {
    webpackCompile(pluginOptions, function(stats) {
      expect(stats.compilation.assets['app.js']).toBeDefined();
      done();
    });
  });

  it('should avoid the proccess if there are missed parameters', function(done) {
    webpackCompile(null, function(stats) {
      expect(stats.compilation.assets[fileName]).not.toBeDefined();
      done();
    });
  });

  it('should show info message if there was any error', function(done) {
    pluginOptions['localesId'] = ['error'];
    webpackCompile(pluginOptions, function(stats) {
      expect(stats.compilation.assets[fileName]).not.toBeDefined();
      done();
    });
  });

  it('should download many translations', function(done) {
    pluginOptions['localesId'] = ['id1', 'id2'];

    webpackCompile(pluginOptions, function(stats) {
      expect(fs.existsSync(path.resolve(__dirname, './es.json'))).toBe(true);
      expect(fs.existsSync(path.resolve(__dirname, './en.json'))).toBe(true);
      done();
    });
  });
});
