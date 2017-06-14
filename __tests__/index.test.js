var path = require('path');
var MemoryFileSystem = require('memory-fs');
var fs = require('fs');

var webpack = require('webpack');

var PhraseAppBuilderPlugin = require('../index.js');

var OUTPUT_DIR = path.resolve(__dirname, './dist');
var fileNameEs = 'es.json';

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

// Mock config

jest.mock('../lib/config', function () {
  return {
    phraseappLocalesUrl: function() {return 'localesURL'},
    phraseappDownloadLocaleUrl: function() {return 'downloadURL'},
    phraseappFormatsUrl: function() {return 'formatsURL'}
  }
});

// Mock helper

jest.mock('../lib/helper', function () {
  return {
    getFormat: function (url){
      return { "api_name": "json", extension: "json" };
    },
    phraseAppRequest: function(url) {
      switch (url) {
        case 'success':
          return Promise.resolve('{ "some": "text" }');
          break;
        case 'localesURL':
          return Promise.resolve('[{ "id": "testEs", "name": "es" }, { "id": "testEn", "name": "en" }]');
          break;
        case 'downloadURL':
          return Promise.resolve('{ "some": "text" }');
          break;
        case 'formatsURL':
          return Promise.resolve('[{ "api_name": "json", "extension": "json" }]');
          break;
        case 'error':
          return Promise.reject(400);
          break;
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
      expect(fs.existsSync(path.resolve(__dirname, './en.json'))).toBe(true);
      done();
    });
  });

  it('should not break the entry point compilation', function(done) {
    webpackCompile(pluginOptions, function(stats) {
      expect(stats.compilation.assets['app.js']).toBeDefined();
      done();
    });
  });

  it('should avoid the process if there are missed parameters', function(done) {
    webpackCompile(null, function(stats) {
      expect(stats.compilation.assets[fileNameEs]).not.toBeDefined();
      done();
    });
  });

  it('should show info message if there was any error', function(done) {
    pluginOptions['localesId'] = ['error'];
    webpackCompile(pluginOptions, function(stats) {
      expect(stats.compilation.assets[fileNameEs]).not.toBeDefined();
      done();
    });
  });

  it('should avoid the process if outputPath is not set', function(done) {
    pluginOptions['outputPath'] = null;
    webpackCompile(pluginOptions, function(stats) {
      expect(stats.compilation.assets[fileNameEs]).not.toBeDefined();
      done();
    });
  });

  it('should create the given path', function(done) {
    const pathToCreate = path.resolve(__dirname, './translations');
    pluginOptions['outputPath'] = pathToCreate;

    webpackCompile(pluginOptions, function(stats) {
      const filePathEs = path.resolve(__dirname, './translations/es.json');
      const filePathEn = path.resolve(__dirname, './translations/en.json');

      expect(fs.existsSync(filePathEs)).toBe(true);
      expect(fs.existsSync(filePathEn)).toBe(true);

      fs.unlinkSync(filePathEs);
      fs.unlinkSync(filePathEn);
      fs.rmdirSync(pathToCreate);
      done();
    });
  });
});
