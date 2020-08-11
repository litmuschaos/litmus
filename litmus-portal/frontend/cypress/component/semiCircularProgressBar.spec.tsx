/// <reference types="Cypress" />

import React from 'react';
import { mount } from 'cypress-react-unit-test';
import SemiCircularProgressBar from '../../src/components/ProgressBar/SemiCircularProgressBar';

// Test Suite -
// Progress Bar props -> value = 50, 10, 100
describe('Semi Circular Progress Bar has appropriate values',()=>{
  [50,10,100].map(i=>{
    it('Value is equal to '+i, () => {
      const wrapper = <SemiCircularProgressBar value={i} />;
      mount(wrapper);
      cy.get('[data-cy=progressValue]').then((value) => {
        expect(value[0].innerText).to.equal(i+'%');
      });
    });
  })
})

// Test Suite - Icon has the correct src
describe('Icons have a correct path', () => {
  it('Progress Bar icon has a correct source', () => {
    const wrapper = <SemiCircularProgressBar value={40} />;
    mount(wrapper);
    cy.get('[data-cy=progressIcon]')
      .should('have.attr', 'src')
      .should('include', './icons/workflows.png');
  });
});
