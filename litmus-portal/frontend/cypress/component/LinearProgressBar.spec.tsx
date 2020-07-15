/// <reference types="Cypress" />
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import LinearProgressBar from '../../src/components/ProgressBar/LinearProgressBar';

describe('Linear Progressbar Testing', () => {
  it('Progressbar color is Red for value 3', () => {
    mount(<LinearProgressBar value={2} />);
    cy.get('.rc-progress-line-path').should('have.attr', 'stroke', '#CA2C2C');
  });
  it('Progressbar color is Green for value 8', () => {
    mount(<LinearProgressBar value={8} />);
    cy.get('.rc-progress-line-path').should('have.attr', 'stroke', '#109B67');
  });
  it('Progressbar color is Yellow for value 6', () => {
    mount(<LinearProgressBar value={6} />);
    cy.get('.rc-progress-line-path').should('have.attr', 'stroke', '#F6B92B');
  });
  it('Progressbar color is default', () => {
    mount(<LinearProgressBar value={8} isDefault={true} />);
    cy.get('.rc-progress-line-path').should('have.attr', 'stroke', '#5B44BA');
  });
});
