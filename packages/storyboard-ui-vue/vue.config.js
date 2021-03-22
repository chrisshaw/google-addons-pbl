const path = require('path')
const webpack = require('webpack')

/**
 * Turns <script> and <link> tags that refer to local files into a call to an
 * `include()` function that can be used in Google Apps Script.
 *
 * @see https://developers.google.com/apps-script/guides/html/templates
 * @see @function core/storyboard-gas/src/main.ts#include
 * @param {Object} context context object exposed by the pre-rendering plugin
 *
 * @todo - This is the a place to move async component chunks from head to body.
 */
const prepareHtmlForGas = (context) => {
  const { html } = context
  const scriptRegex = /<script[^>]+?src=["'](\/js\/.+?\.js)["'][^<]*?>\s*?<\/script>/g
  const linkRegex = /<link[^>]+?href=["'](\/css\/.+?\.css)["'][^<]*?>/g
  // The $1 is a reference to the capture group in both of the preceding regexes.
  const includeString = '<?!= include("build/ui$1"); ?>'

  const gasHtml = html.replace(scriptRegex, includeString)
    .replace(linkRegex, includeString)

  context.html = gasHtml
  return context
}

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          includePaths: [
            path.resolve(__dirname, 'node_modules')
          ]
        }
      }
    }
  },
  chainWebpack: (config) => {
    /**
       * We usually would want these plugins.
       *
       * But GAS can't do anything with them.
       *
       * We need to find a way to take these and instead
       * re-inject them as script tags in the body as the
       * latest tags so they get included after everything else.
       *
       * Or even better, create a way to take such tags and
       * have the google client ajax them in (basically just
       * recreating what webpack does).
       */
    const plugins = config.plugins
    plugins.delete('preload')
    plugins.delete('prefetch')

    /**
         * Now, we need to use the real Google Apps Script
         * HtmlService client, not the mock one.
         */
    const mode = config.get('mode')
    if (mode === 'production') {
      config
        .plugin('normal')
        .use(
          webpack.NormalModuleReplacementPlugin,
          [
            /\.\.\/\.\.\/dev\/mocks\/gas\/HtmlService\/gas-client\.dev\.js/,
            './gas-client.js'
          ]
        )
        .before('extract-css')
    }
  },
  pluginOptions: {
    prerenderSpa: {
      registry: undefined,
      renderRoutes: [
        '/'
      ],
      useRenderEvent: true,
      headless: true,
      onlyProduction: true,
      postProcess: prepareHtmlForGas
    }
  }
}
