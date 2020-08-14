/// <reference types="Cypress" />

import React from 'react';
import { mount } from 'cypress-react-unit-test';
import CustomStepper from '../../src/components/CustomStepper';
import { Provider } from 'react-redux';
import configureStore from '../../src/redux/configureStore';
const {store} = configureStore();

// Test Suite - Stepper Labels are present
describe('Input Data is present', () => {
  const wrapper = (<Provider store={store}><CustomStepper /></Provider>);
  const expectedOutput = [
    'Target Cluster',
    'Choose a workflow',
    'Tune workflow',
    'Reliability score',
    'Schedule',
    'Verify and Commit',
  ];

  let i = 0;
  expectedOutput.map((currentExpectedOutput) => {
    it(`Steps label is present`, () => {
      mount(wrapper);
      cy.get('[data-cy=labelText]').then((item) => {
        expect(item[i - 1].innerText).to.equal(currentExpectedOutput);
      });
      i++;
    });
  });
});

// Test Suite - Active label has a color of rgb(121, 134, 203)
describe('Active Label is colored theme.palette.primary.light', () => {
  const wrapper = (<Provider store={store}><CustomStepper /></Provider>);
  it('Active theme color is correct', () => {
    mount(wrapper);
    cy.get('[data-cy=labelText]').then((item) => {
      cy.get(item[0]).should('have.css', 'color', 'rgb(121, 134, 203)');
    });
  });
});
