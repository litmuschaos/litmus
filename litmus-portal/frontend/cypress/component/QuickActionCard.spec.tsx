/// <reference types="Cypress" />
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import { BrowserRouter } from 'react-router-dom';
import QuickActionCard from '../../src/components/QuickActionCard';

describe('QuickActionCard Testing', () => {
  it('Component is Visible', () => {
    mount(
      <BrowserRouter>
        <QuickActionCard />
      </BrowserRouter>
    );
  });
  it('Connect a cluster', () =>
    cy
      .get(':nth-child(1) > .makeStyles-listItem-2')
      .should('be.visible')
      .click());
  it('Invite a team member', () =>
    cy
      .get(':nth-child(2) > .makeStyles-listItem-2')
      .should('be.visible')
      .click());
  it('Take a quick survey', () =>
    cy
      .get(':nth-child(3) > .makeStyles-listItem-2')
      .should('be.visible')
      .click());
  it('Read Litmus Docs', () =>
    cy
      .get(':nth-child(4) > .makeStyles-listItem-2')
      .should('be.visible')
      .click());
});
