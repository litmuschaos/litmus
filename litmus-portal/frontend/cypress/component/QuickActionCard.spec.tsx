/// <reference types="Cypress" />
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import QuickActionCard from '../../src/components/QuickActionCard';
import ProviderWrapper from '../../src/testHelpers/ProviderWrapper';

const Component = (<ProviderWrapper><QuickActionCard /></ProviderWrapper>)

describe('QuickActionCard Testing', () => {
  it('Component is Visible', () => {
    mount(Component);
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
