# Sidekick Svelte Components

> Credits to https://github.com/YogliB/svelte-component-template

## Get started

0. Go to the Sidekick monorepo. `pwd` should `sidekick`
1. `cd core/components-svelte`
2. `npm run dev`
3. `npm run cypress:open`
4. You can now test existing components. When you make changes to either the test or the component, the test will rerun. Nice!

## Making a new component? Set up your test!

> Use `Select.spec.js` as a starting example for the following steps.

1. Create a new spec file for your component in `cypress/integrations`.
2. Import your file from the **compiled** bundle `dist/index.min.js`. We do this because rollup is not well supported by Cypress.
3. Start by writing a "render" test, which just checks that the component exists. You'll also use this to visually inspect your component as you build it.
4. "Instrument" your Svelte component's html template with `data-` attributes for testing so Cypress can select them later.
5. Add your component to the appropriate place in the `src/components` folder, and make sure you export it in `src/components.js`
6. Start writing your component. When you've got a renderable template, it'll show up!
7. Add whatever tests you need. Build a component that fits.

### For more help look at the below code samples

These all come from `Select.spec.js` **but they are not a complete file**, so **don't** think you can copy and paste this.

```js
import { Select } from '../../dist/index.min.js' // Replace Select with your component
import mount from '../support/mount'

// Under your describe(), make sure you include this
beforeEach(() => {
    cy.visit('/')
    mount(Select) // Replace Select with your component
})

// To check whether the file renders (and also allow you to use Cypress to view the component in isolation
it('renders', () => {
    cy.get('[data-cy-select]')
})

// When you need to interact with a component for a test, include this
let select = Cypress.component

// Then you can interact with the component using $set and $on
select.$set(props)
select.$on('event', handler)
```

The `data-` attributes you use to instrument your components should start with `data-cy-`. Then make them whatever makes sense.

The following sample comes from the `Select.svelte` component.

```html
<span bind:this={control} class="select" on:click={setXOnClick} on:click={toggleModal} data-cy-select >
  <div class="select-value">{valueLabel}</div>
  <div class="select-label" data-cy-select-label>{label}</div>
</span>
```

## Changes from the original

- Add Cypress for a "storybook"-type setup
- Remove the App and the public folder because we don't need them. **Just** use Cypress.
- Remove eslint, lint-staged, prettier, and husky. All these things are essential, but I need to really learn them first.
- Change the entry from components.module.js to components.js

---

_Psst — looking for an app template? Go here --> [sveltejs/template](https://github.com/sveltejs/template)_

---

# Svelte 3 Component Template

[![Known Vulnerabilities](https://snyk.io/test/github/YogliB/svelte-component-template/badge.svg)](https://snyk.io/test/github/YogliB/svelte-component-template)

## Getting started

1. Clone it with [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit YogliB/svelte-component-template my-new-component
```

2. `cd` into the folder and install the `node_modules`:

```bash
cd my-new-component
npm ci
```

- The `ci` command makes sure your packages match the one in the `package-lock.json` (See [here](https://docs.npmjs.com/cli/ci.html)).

3. Run `npm init`, to configure the project.
4. Replace this `README` with your own.

Your component's source code lives in `src/components/[MyComponent].svelte`.

## Developing

1. Start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

2. Edit a component file in `src/components`, save it, and reload the page to see your changes.

3. Make sure your component is exported in `src/components/components.module.js`.

4. Make sure your component is imported and nested in `src/App.svelte`.

5. Navigate to [localhost:5000](http://localhost:5000) to see your components live.

## Consuming components

Your package.json has a `"svelte"` field pointing to `src/components/components.module.js`, which allows Svelte apps to import the source code directly, if they are using a bundler plugin like [rollup-plugin-svelte](https://github.com/rollup/rollup-plugin-svelte) or [svelte-loader](https://github.com/sveltejs/svelte-loader) (where [`resolve.mainFields`](https://webpack.js.org/configuration/resolve/#resolve-mainfields) in your webpack config includes `"svelte"`). **This is recommended.**

For everyone else, `npm run build` will bundle your component's source code into a plain JavaScript module (`index.mjs`) and a UMD script (`index.js`), in the `dist` folder.<br>
This will happen automatically when you publish your component to npm, courtesy of the `prepublishOnly` hook in package.json.

## Publishing to [npm](https://www.npmjs.com)

- [Creating and publishing scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
- [Creating and publishing unscoped public packages](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages)

## Credits & Inspiration

- Official [component-template](https://github.com/sveltejs/component-template) by @Rich-Harris
- Official [app-template](https://github.com/sveltejs/template) by @Rich-Harris
- [This](https://github.com/sveltejs/component-template/pull/5) PR by @sisou
