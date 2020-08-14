/// <reference types="Cypress" />
import React from 'react';
import { mount } from 'cypress-react-unit-test';

import CustomSlider from '../../src/components/CustomSlider/index';

describe("Testing Custom Slider with different values",()=> {
  [10,5,2].map(i=>{
    context('Custom Slider with value '+i, () => {
      it('is visible', () => {
        const wrapper = (
          <CustomSlider testName="Test" weight={i} index={1} handleChange={() => {}} />
        );
        mount(wrapper);
        expect(wrapper.props.weight).to.equal(i);
      });
    
      it('The slider is enabled', () => {
        cy.get('.MuiSlider-root').first().log('Slider Enabled');
      });
      it('The selected value is '+i, () => {
        cy.get('.MuiSlider-markLabel').contains(i).click();
      });
      it('Value displayed is '+i+' points', () => {
        cy.get('.makeStyles-testResult-3').should('have.text', i+' points');
      });
    });
  })
})