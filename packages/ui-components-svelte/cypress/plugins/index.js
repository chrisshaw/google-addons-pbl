// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// const rollup = require('./rollup-preprocessor')
const watch = require('@cypress/watch-preprocessor')


module.exports = (on) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  /**
   * I couldn't get rollup to bundle correctly. I think because of Electron.
   */
  // on("file:preprocessor", rollup);

  /**
   * So instead we're going to just use Cypress's watcher for when any of the files change.
   * 
   * And then we'll use the bundled dist for the Svelte components.
   */
  // on("file:preprocessor", watch())
};
