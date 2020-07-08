/// <reference types="Cypress" />

describe("Testing the Rechablity of Login page",()=>{
    
    it("Visiting the Login Page",()=>{
        cy.visit("/login");
        cy.log("Visited the Login page Successfully");
    });

    it("Checking the functionality of Login Screen UI",()=>{
        cy.visit('/login');
        cy.get('[data-cy=inputEmail]').type('User@gmail.com');
        cy.get('#filled-email-input').should('have.value','User@gmail.com');
        cy.get('[data-cy=inputPassword]').type('User123');
        cy.get('#filled-password-input').should('have.value','User123');
        cy.get('[data-cy=loginButton]').click();
    })

})

