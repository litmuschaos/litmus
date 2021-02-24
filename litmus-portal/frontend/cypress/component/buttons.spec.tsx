/// <reference types="Cypress" />
import { ButtonOutlined, ButtonFilled } from 'litmus-ui';
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import { Typography } from '@material-ui/core';

describe('Button Filled', () => {
  it('The button is clickable', () => {
    mount(
      <ButtonFilled onClick={() => console.log('Handle Click')}>
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
      <ButtonOutlined disabled onClick={() => console.log('Handle Click')}>
        <Typography>Test</Typography>
      </ButtonOutlined>
    );

    cy.get('.MuiButtonBase-root')
      .first()
      .should('be.disabled')
      .log('Button Disabled');
  });
  it('The button is enabled', () => {
    mount(
      <ButtonOutlined onClick={() => console.log('Handle Click')}>
        <Typography>Test</Typography>
      </ButtonOutlined>
    );
    cy.get('.MuiButtonBase-root')
      .first()
      .should('be.enabled')
      .click()
      .log('Button Clicked');
  });
});
