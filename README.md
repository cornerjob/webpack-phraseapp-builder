# Webpack PhraseAppBuilder Plugin

Webpack plugin for generating translations files from PhraseApp.
This plugin uses the download API endpoint from PhraseApp, for further information please see the following [link](https://phraseapp.com/docs/api/v2/locales/#download)
This plugin will run before the Webpack compilation, so the translations are available before the Webpack assertions.

*Since this plugin will download the translations before the assertions, is not recommended to use the same path as the [output path for Webpack](https://github.com/webpack/docs/wiki/configuration#configuration-object-content) assertions*

## Install

To install the package run the following command:
```shell
  npm install -D webpack-phraseapp-builder
```

## Usage

In your `webpack.config.js`

```javascript
var PhraseAppBuilderPlugin = require('webpack-phraseapp-builder');

module.exports = {
    // ...
    plugins: [
      new PhraseAppBuilderPlugin({
        accessToken: 'theAccesTokenId',  // Get your accessToken from PhraseApp
        projectId: 'theProjectId', // Get the project id from PhraseApp
        outputPath: 'path',
        format: 'json' // specify the format from Phraseapp
      })
    ]
};
```

This will generate translations files in your configured output directory, for example:

```json
// src/translations/es.json

{
  "some.key": "hello",
}
```

**Options:**

* `localesId`: The locales id from your PhraseApp project.
* `accessToken`: The accessToken to authorize the PhraseApp API.
* `outputPath`: The path where you want to download the translations.
* `projectId`: The project id from PhraseApp from where you want to extract your translations
* `format`: The format to download the translations
