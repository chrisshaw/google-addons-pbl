/**
 * This was ripped from dschulten/cypress-rollup-preprocessor, bahmutov/rolling-task,
 * and cypress-io/cypress-webpack-preprocessor
 *
 * It's naive to how I use it. For example, it always assumes you want to watch files.
 *
 * @see https://github.com/cypress-io/cypress-watch-preprocessor/blob/master/index.js
 * - I used this as inspiration once I gave up on a more complex setup.
 *
 * @see https://github.com/dschulten/cypress-rollup-preprocessor/blob/master/index.js
 * - I used this to figure out how to do it, basically, and then just cleaned it up.
 *
 * @see https://github.com/cypress-io/cypress-webpack-preprocessor/blob/master/index.js
 * - This was used to figure out how to work with Cypress's Preprocessor API
 *
 * @see https://github.com/bahmutov/rolling-task/blob/master/cypress/plugins/index.js
 * - I used this to figure out how rollup worked
 *
 * @see https://github.com/bahmutov/rolling-task/blob/master/cypress/integration/spec.js
 */

const rollup = require("rollup");
const rollupConfig = require("../../rollup-preprocessor.config");
const END_EVENT = "END";
const rollers = {};

/**
 * Takes in the file:preprocessor event object from Cypress and writes out a bundle for Cypress to use
 * @param {Object} config - config object from rollup.config.js
 */
const preprocessor = (config) => (file) => {
  console.log("preprocessor(config)(file) start");
  console.log("file", file);
  const plugins = config.plugins,
    watch = config.watch;

  const filePath = file.filePath,
    outputPath = file.outputPath;

  if (rollers[filePath]) {
    return filePath;
  }

  /**
   * We overwrite the existing input from rollup.config.js with the spec filePath
   */
  const inputOptions = {
    input: filePath,
    plugins: plugins
  };

  /**
   * We need to set a new output destination for Cypress.
   * This is different from the out in rollup.config.js
   */
  const outputOptions = {
    file: outputPath,
    format: "cjs",
    sourcemap: "inline"
  };

  const watchOptions = Object.assign({}, watch, {
    /**
     * chokidar, whatever this is, has a problem with Linux.
     * Explicitly setting it to false makes it better.
     *
     * @see https://github.com/sveltejs/template/issues/29
     */
    // chokidar: false
  });

  const allOptions = Object.assign(
    {},
    inputOptions,
    { output: [outputOptions] },
    { watch: watchOptions }
  );
  console.log("allOptions", allOptions);
  console.log("Attempt to begin watching using rollup.watch(allOptions)");
  const watcher = rollup.watch(allOptions);
  rollers[filePath] = watcher;

  watcher.on("event", event => {
    console.log('Watcher triggered an event', event)
    const code = event.code
    if (code === END_EVENT) {
      console.log("Bundle has been built. Rerun the tests!");
      file.emit("rerun");
    }
  });

  file.on("close", () => {
    console.log("Closing the spec. Close the watcher!");
    watcher.close();
  });

  return filePath;
};

module.exports = preprocessor(rollupConfig)