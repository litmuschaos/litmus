/// <reference types="Cypress" />
import React, { useState } from 'react';
import { mount } from 'cypress-react-unit-test';

import CustomSlider from '../../src/components/CustomSlider/index';
describe('Custom Slider with value 10', () => {
  it('is visible', () => {
    const wrapper = (
      <CustomSlider testName="Test" value={10} onChangeCommitted={() => {}} />
    );
    mount(wrapper);
    expect(wrapper.props.value).to.equal(10);
  });

  it('The slider is enabled', () => {
    cy.get('.MuiSlider-root').first().log('Slider Enabled');
  });
  it('The selected value is 10', () => {
    cy.get('.MuiSlider-markLabel').contains('10').click();
  });
  it('Value displayed is 10 points', () => {
    cy.get('.makeStyles-testResult-3').should('have.text', '10 points');
  });
});

describe('Custom Slider with value 5', () => {
  it('is visible', () => {
    const wrapper = (
      <CustomSlider testName="Test" value={5} onChangeCommitted={() => {}} />
    );
    mount(wrapper);
    expect(wrapper.props.value).to.equal(5);
  });

  it('The slider is enabled', () => {
    cy.get('.MuiSlider-root').first().log('Slider Enabled');
  });
  it('The selected value is 10', () => {
    cy.get('.MuiSlider-markLabel').contains('5').click();
  });
  it('Value displayed is 10 points', () => {
    cy.get('.makeStyles-testResult-3').should('have.text', '5 points');
  });
});

describe('Custom Slider with value 2', () => {
  it('is visible', () => {
    const wrapper = (
      <CustomSlider testName="Test" value={2} onChangeCommitted={() => {}} />
    );
    mount(wrapper);
    expect(wrapper.props.value).to.equal(2);
  });

  it('The slider is enabled', () => {
    cy.get('.MuiSlider-root').first().log('Slider Enabled');
  });
  it('The selected value is 10', () => {
    cy.get('.MuiSlider-markLabel').contains('2').click();
  });
  it('Value displayed is 10 points', () => {
    cy.get('.makeStyles-testResult-3').should('have.text', '2 points');
  });
});

describe('Custom Slider with value 8', () => {
  it('is visible', () => {
    const wrapper = (
      <CustomSlider testName="Test" value={8} onChangeCommitted={() => {}} />
    );
    mount(wrapper);
    expect(wrapper.props.value).to.equal(8);
  });

  it('The slider is enabled', () => {
    cy.get('.MuiSlider-root').first().log('Slider Enabled');
  });
  it('The selected value is 10', () => {
    cy.get('.MuiSlider-markLabel').contains('8').click();
  });
  it('Value displayed is 10 points', () => {
    cy.get('.makeStyles-testResult-3').should('have.text', '8 points');
  });
});
