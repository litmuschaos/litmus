/// <reference types="Cypress" />
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import { Typography } from '@material-ui/core';
import ButtonFilled from '../../src/components/Button/ButtonFilled';
import ButtonOutline from '../../src/components/Button/ButtonOutline';

describe('Button Filled', () => {
  it('The button is clickable', () => {
    mount(
      <ButtonFilled
        isPrimary = {true}
        handleClick={() => console.log('Handle Click')}
      >
        <Typography>Test</Typography>
      </ButtonFilled>
    );

    cy.get('.MuiButtonBase-root')
      .first()
      .should('be.enabled')
      .click()
      .log('Button Clicked');
  });
});
describe('Button Outline', () => {
  it('The button is disabled', () => {
    mount(
      <ButtonOutline
        isDisabled={true}
        handleClick={() => console.log('Handle Click')}
      >
        <Typography>Test</Typography>
      </ButtonOutline>
    );

    cy.get('.MuiButtonBase-root')
      .first()
      .should('be.disabled')
      .log('Button Disabled');
  });
  it('The button is enabled', () => {
    mount(
      <ButtonOutline
        isDisabled={false}
        handleClick={() => console.log('Handle Click')}
      >
        <Typography>Test</Typography>
      </ButtonOutline>
    );
    cy.get('.MuiButtonBase-root')
      .first()
      .should('be.enabled')
      .click()
      .log('Button Clicked');
  });
});
