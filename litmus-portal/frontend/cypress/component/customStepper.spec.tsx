/// <reference types="Cypress" />

import React from 'react';
import { mount } from 'cypress-react-unit-test';
import CustomStepper from '../../src/components/CustomStepper';

// Test Suite - Stepper Labels are present
describe('Input Data is present', () => {
  const wrapper = <CustomStepper />;
  it('Steps 1 label is present', () => {
    mount(wrapper);
    cy.get('[data-cy=labelText]').then((item) => {
      expect(item[0].innerText).to.equal('Target Cluster');
    });
  });

  it('Steps 2 label is present', () => {
    mount(wrapper);
    cy.get('[data-cy=labelText]').then((item) => {
      expect(item[1].innerText).to.equal('Choose a workflow');
    });
  });

  it('Steps 3 label is present', () => {
    mount(wrapper);
    cy.get('[data-cy=labelText]').then((item) => {
      expect(item[2].innerText).to.equal('Tune workflow');
    });
  });

  it('Steps 4 label is present', () => {
    mount(wrapper);
    cy.get('[data-cy=labelText]').then((item) => {
      expect(item[3].innerText).to.equal('Reliability score');
    });
  });

  it('Steps 5 label is present', () => {
    mount(wrapper);
    cy.get('[data-cy=labelText]').then((item) => {
      expect(item[4].innerText).to.equal('Schedule');
    });
  });

  it('Steps 6 label is present', () => {
    mount(wrapper);
    cy.get('[data-cy=labelText]').then((item) => {
      expect(item[5].innerText).to.equal('Verify and Commit');
    });
  });
});

// Test Suite - Active label has a color of rgb(121, 134, 203)
describe('Active Label is colored theme.palette.primary.light', () => {
  const wrapper = <CustomStepper />;
  it('Active theme color is correct', () => {
    mount(wrapper);
    cy.get('[data-cy=labelText]').then((item) => {
      cy.get(item[0]).should('have.css', 'color', 'rgb(121, 134, 203)');
    });
  });
});
