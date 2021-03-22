import { Card } from '../../dist/index.min.js'
import mount from '../support/mount'

describe('Card', () => {

    beforeEach(() => {
        cy.visit('/')
        mount(Card)
    })

    it('renders', () => {
        cy.get('[data-cy-card]')
    })

})
