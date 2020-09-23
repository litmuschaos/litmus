/// <reference types="Cypress" />
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import InfoTooltip from '../../src/components/InfoTooltip';

describe('ToolTip testing', () => {
  it('visible', () => {
    mount(
      <div>
        <InfoTooltip value="Demo text" />
        <div data-cy="divBody" />
      </div>
    );
  });
  it('Tooltip value is clickable', () => {
    cy.get('.makeStyles-infoImg-1').should('be.visible').click();
  });
  const tooltipHidden = () => {
    cy.get('.MuiTooltip-popper').should('not.be.visible');
  };

  it('Value is being displayed on Click', () => {
    cy.get('.makeStyles-infoImg-1')
      .should('be.visible')
      .click()
      .get('.MuiTooltip-popper')
      .should('contain.text', 'Demo text');
  });
  it('Value is disappeared when clicked anywhere else on the screen', () => {
    cy.get('.makeStyles-infoImg-1').click().get('html').click(100, 30);
    tooltipHidden();
  });
});
