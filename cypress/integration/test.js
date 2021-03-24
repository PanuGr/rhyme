describe('visit the website',()=>{
    it('blank page',()=>{
        cy.visit('/')
        cy.get('#options').should('have.value','sl')
        cy.get('#userWord').should('contain','')
        cy.get('#textarea').should('contain','')
    })
    it('type word and click',()=>{
        cy.get('#userWord').type('sea')
        cy.get('.btn').click()
        cy.get('ol>li')
        })

        it('see and click results',()=>{
            cy.get('li').first().trigger('mouseover')
            cy.get('li').first().click()
        })
        it('refresh',()=>{
            cy.visit('/')
        })
})