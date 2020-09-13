/// <reference types="Cypress" />
import React from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { mount } from 'cypress-react-unit-test';
import QuickActionCard from '../../src/components/QuickActionCard';
import configureStore from '../../src/redux/configureStore';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
const { store } = configureStore();
const client = new ApolloClient({
  cache: new InMemoryCache(),
});
const wrapper = (
  <ApolloProvider client={client}>
    <Provider store={store}>
      <BrowserRouter>
        <QuickActionCard />
      </BrowserRouter>
    </Provider>
  </ApolloProvider>
);
describe('QuickActionCard Testing', () => {
  it('Component is Visible', () => {
    mount(wrapper);
  });
  it('Invite a team member', () =>
    cy
      .get(':nth-child(1) > .makeStyles-listItem-2')
      .should('be.visible')
      .click()
      .location()
      .should((loc) => {
        expect(loc.href).to.include('/settings');
      }));
  it('Take a quick survey and check the survey link', () =>
    cy
      .get(':nth-child(2) > .makeStyles-listItem-2')
      .should('be.visible')
      .should('have.attr', 'href', 'https://forms.gle/qMuVphRyEWCFqjD56'));
  it('Read Litmus Docs and check the docs link', () =>
    cy
      .get(':nth-child(3) > .makeStyles-listItem-2')
      .should('be.visible')
      .should(
        'have.attr',
        'href',
        'https://docs.litmuschaos.io/docs/getstarted/'
      ));
});
