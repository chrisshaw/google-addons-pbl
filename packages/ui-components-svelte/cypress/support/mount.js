/**
 * Cypress-specific, Svelte-specific utility function.
 * Takes a Svelte component and attaches it to the body of the iframe document.
 * 
 * Inspired by the actual cypress-svelte-unit-test package, which I couldn't
 * get to work because I didn't want to use webpack.
 * 
 * @see https://github.com/bahmutov/cypress-svelte-unit-test/blob/master/src/index.js
 * 
 * @param {Object} SvelteComponent - Svelte component constructor
 * @param {Object} props - props object formatted to Svelte's API
 */
export default (SvelteComponent, props) => {
  return cy.document({ log: false }).then(doc => {
    const target = doc.body;
    const comp = new SvelteComponent({
      target,
      props
    });

    /**
     * We store the reference to this new component in the Cypress globals
     */
    Cypress.component = comp
  })
}
