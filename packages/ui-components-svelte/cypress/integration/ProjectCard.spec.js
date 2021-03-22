import { ProjectCard } from '../../dist/index.min.js'
import mount from '../support/mount'

describe('ProjectCard', () => {

    beforeEach(() => {
        cy.visit('/')
        mount(ProjectCard)
    })

    it('renders', () => {
        cy.get('[data-cy-proj-card]')
    })
    
})