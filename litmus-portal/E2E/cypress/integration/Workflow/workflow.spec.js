/// <reference types="Cypress" />

describe("Testing the Rechablity of Workflow page",()=>{
    
    it("Visiting the workflow page",()=>{
        cy.visit("/workflow");
        cy.log("Visited the workflow page Successfully");
    });

})

