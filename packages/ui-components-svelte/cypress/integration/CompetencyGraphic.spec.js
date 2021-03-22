import { CompetencyGraphic } from '../../dist/index.min.js'
import mount from '../support/mount'

describe('CompetencyGraphic', () => {

    beforeEach(() => {
        cy.visit('/')
        mount(CompetencyGraphic)
    })

    it('renders', () => {
        cy.get('[data-cy-proj-card]')
    })
    
})