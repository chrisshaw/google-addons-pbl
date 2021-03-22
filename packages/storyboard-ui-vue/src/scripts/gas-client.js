/**
 * This feels **very** hacky. I'm sure there's a better way.
 *
 * This just exports the window's global `google` object that the
 * Google Apps Script HtmlService exposes.
 *
 *
 * @see https://developers.google.com/apps-script/guides/html/reference/run
 */

let _google
if (typeof google === 'undefined') {
  _google = {
    script: {
      get run () {
        return {
          withSuccessHandler: () => this.run,
          withFailureHandler: () => this.run,
          withUserObject: () => this.run,
          getUserData: () => new Promise((resolve, reject) => resolve()),
          getAndCacheListData: () => new Promise((resolve, reject) => resolve()),
          logClick: () => {}
        }
      }
    }
  }
  console.error(`
        The 'google' global from Google App Script's HtmlService is undefined.
        
        We're stubbing it so we can prerender but this means something is wrong.
    `)
  console.warn('Stubbed client', _google)
} else {
  _google = google
}

export default _google
export { _google as google }
