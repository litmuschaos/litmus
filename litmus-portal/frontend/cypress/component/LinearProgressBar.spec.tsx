/// <reference types="Cypress" />
import { mount } from 'cypress-react-unit-test';
import React from 'react';
import LinearProgressBar from '../../src/components/ProgressBar/LinearProgressBar';

describe('Linear Progressbar Testing', () => {
  it('Progressbar stroke for value 3', () => {
    mount(<LinearProgressBar width={1.5} value={2} />);
    cy.get('.rc-progress-line-path').should(
      'have.css',
      'stroke-dasharray',
      '20px, 100px'
    );
  });
  it('Progressbar stroke for value 8', () => {
    mount(<LinearProgressBar width={1.5} value={8} />);
    cy.get('.rc-progress-line-path').should(
      'have.css',
      'stroke-dasharray',
      '80px, 100px'
    );
  });
  it('Progressbar stroke for value 6', () => {
    mount(<LinearProgressBar width={1.5} value={6} />);
    cy.get('.rc-progress-line-path').should(
      'have.css',
      'stroke-dasharray',
      '60px, 100px'
    );
  });
  it('Progressbar stroke if default', () => {
    mount(<LinearProgressBar width={1.5} value={8} isDefault />);
    cy.get('.rc-progress-line-path').should(
      'have.css',
      'stroke-dasharray',
      '80px, 100px'
    );
  });
});
