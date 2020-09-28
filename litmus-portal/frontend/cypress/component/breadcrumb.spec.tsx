/// <reference types="Cypress" />
import { mount } from 'cypress-react-unit-test';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import BreadCrumbs from '../../src/components/BreadCrumbs';

describe('BreadCrumbs', () => {
  it('Breadcrumb should be => Workflows', () => {
    mount(
      <BrowserRouter>
        <BreadCrumbs location="/workflows" />
      </BrowserRouter>
    );

    cy.get('.makeStyles-breadCrumb-1').should('have.html', 'Workflows');
  });

  it('Breadcrumb should be => First/Second', () => {
    mount(
      <BrowserRouter>
        <BreadCrumbs location="/First/Second" />
      </BrowserRouter>
    );

    cy.get('.MuiBreadcrumbs-li')
      .get('.makeStyles-breadCrumb-1')
      .then((val) => {
        expect(val[0].innerText).to.equal('First');
        expect(val[1].innerText).to.equal('Second');
      });
  });

  it('Breadcumb route should be same => Workflows/Details should be /Workflows/Details', () => {
    mount(
      <BrowserRouter>
        <BreadCrumbs location="/Workflows/Details" />
      </BrowserRouter>
    );

    cy.get('.MuiBreadcrumbs-li')
      .get('.makeStyles-breadCrumb-1')
      .then((val) => {
        expect(val[0].pathname).to.equal('/Workflows');
        expect(val[1].pathname).to.equal('/Workflows/Details');
      });
  });

  it('Should navigate to selected Route on click', () => {
    mount(
      <BrowserRouter>
        <BreadCrumbs location="/First/Second" />
      </BrowserRouter>
    );

    cy.get('.MuiBreadcrumbs-li')
      .get('.makeStyles-breadCrumb-1')
      .first()
      .click()
      .should('have.attr', 'href', '/First');
  });
});
