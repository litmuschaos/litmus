/// <reference types="Cypress" />

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import { Provider } from 'react-redux';
import CustomStepper from '../../src/components/WorkflowStepper';
import configureStore from '../../src/redux/configureStore';

const { store } = configureStore();

const client = new ApolloClient({
  cache: new InMemoryCache(),
});

const wrapper = (
  <ApolloProvider client={client}>
    <Provider store={store}>
      <CustomStepper />
    </Provider>
  </ApolloProvider>
);

// Test Suite - Stepper Labels are present
describe('Input Data is present', () => {
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
  it('Active theme color is correct', () => {
    mount(wrapper);
    cy.get('[data-cy=labelText]').then((item) => {
      cy.get(item[0]).should('have.css', 'color', 'rgb(121, 134, 203)');
    });
  });
});
