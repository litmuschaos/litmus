/// <reference types="Cypress" />

import React from 'react';
import { mount } from 'cypress-react-unit-test';
import SemiCircularProgressBar from '../../src/components/SemiCircularProgressBar';

// Test Suite -
// Progress Bar props -> value = 50, 10, 100
describe('Semi Circular Progress Bar has appropriate values', () => {
  it('Value is equal to 50', () => {
    const wrapper = <SemiCircularProgressBar value={50} />;
    mount(wrapper);
    cy.get('[data-cy=progressValue]').then((value) => {
      expect(value[0].innerText).to.equal('50%');
    });
  });

  it('Value is equal to 10', () => {
    const wrapper = <SemiCircularProgressBar value={10} />;
    mount(wrapper);
    cy.get('[data-cy=progressValue]').then((value) => {
      expect(value[0].innerText).to.equal('10%');
    });
  });

  it('Value is equal to 100', () => {
    const wrapper = <SemiCircularProgressBar value={100} />;
    mount(wrapper);
    cy.get('[data-cy=progressValue]').then((value) => {
      expect(value[0].innerText).to.equal('100%');
    });
  });
});

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
