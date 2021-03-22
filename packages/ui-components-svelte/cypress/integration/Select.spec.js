/// <reference types="Cypress" />

/**
 * I chose rollup as the library bundler.
 * There is no preprocessor for rollup.
 * The one I built leads to an Unexepected Identifier error.
 * FML.
 * 
 * Instead, we're going to use the bundled version of the component
 * with a helper function I added to {@file cypress/support/mount.js}
 * 
 * Now, for every spec, we need a little more boilerplate.
 * The mount() function sets the Cypress.component global to
 * whatever component it just mounted.
 * 
 * So we need to retrieve it using Cypress.component.
 * 
 * Then we can set props or listen to events.
 * We have to use the $set and $on method in the component API
 * @see https://svelte.dev/docs#Client-side_component_API
 * 
 */

 // import mount from "cypress-svelte-unit-test";
import { Select } from '../../dist/index.min.js'
import mount from '../support/mount'

describe('Select', () => {

    beforeEach(() => {
        cy.visit('/')
        mount(Select)
    })

    it('renders', () => {
        cy.get('[data-cy-select]')
    })

    it('sets the label', () => {
        const props = {
            label: 'Select some random stuff please!'
        }

        let select = Cypress.component
        select.$set(props)
        cy  .get('[data-cy-select-label]')
            .contains(props.label)
    })

    it('shows chip options on click', () => {
        const props = {
            label: 'Testing click for options',
            placeholder: 'Testing testing...',
            options: [
                { id: 'test-1', label: 'Test 1' },
                { id: 'test-2', label: 'Test 2' }
            ]
        }

        let select = Cypress.component
        select.$set(props)
        cy  .get('[data-cy-select]')
            .click()
            .get('[data-cy-options-chips]')
            .contains('Test 1')
    })

    it('selects an option on click', () => {
        const props = {
            label: 'Testing if this changes',
            options: [
                { id: 'test-1', label: 'Test 1' },
                { id: 'test-2', label: 'Test 2' }
            ]
        }

        let select = Cypress.component

        const CHOICE = 1
        const chosenOption = props.options[CHOICE]
        select.$set(props)
        cy.window().then( (win) => {
            win.addEventListener('selected', ({value: eValue}) => {
                const val = eValue[CHOICE]
                console.log(val)
                assert(val.selected !== chosenOption.selected)
            })
        })

        cy  .get('[data-cy-select]')
            .click()
        
        cy  .contains(chosenOption.label)
            .click()

    })
})