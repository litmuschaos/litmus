/// <reference types="Cypress" />
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import ButtonOutlineIcon from '../../src/components/ButtonOutlineIcon';
import { Typography } from '@material-ui/core';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import ButtonFilled from '../../src/components/ButtonFilled';
import ButtonOutline from '../../src/components/ButtonOutline';

describe('Button Filled', () => {
  it('The button is clickable', () => {
    mount(
      <ButtonFilled
        value={'Test'}
        handleClick={() => console.log('Handle Click')}
      />
    );

    cy.get('.MuiButtonBase-root')
      .first()
      .should('be.enabled')
      .click()
      .log('Button Clicked');
  });
});
describe('Button Filled', () => {
  it('The button is clickable', () => {
    mount(
      <ButtonOutlineIcon
        isDisabled={false}
        handleClick={() => console.log('Handle Click')}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <PlayCircleOutlineIcon />
          <Typography>Demo Launch</Typography>
        </div>
      </ButtonOutlineIcon>
    );

    cy.get('.MuiButtonBase-root')
      .first()
      .should('be.enabled')
      .click()
      .log('Button Click');
  });
});
describe('Button Filled', () => {
  it('The button is disabled', () => {
    mount(
      <ButtonOutline
        isDisabled={true}
        value={'Test'}
        handleClick={() => console.log('Handle Click')}
      />
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
        value={'Test'}
        handleClick={() => console.log('Handle Click')}
      />
    );
    cy.get('.MuiButtonBase-root')
      .first()
      .should('be.enabled')
      .click()
      .log('Button Clicked');
  });
});
