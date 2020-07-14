/// <reference types="Cypress" />
import React from 'react';
import { mount } from 'cypress-react-unit-test';
import InfoFilled from '../../src/components/InfoFilled';

describe('Analytics Card->Operator ', () => {
  const component = (
    <InfoFilled
      color="#109B67"
      value={12345}
      statType="Operator Installed"
      plus={true}
    />
  );
  it('Stat card is rendered', () => {
    mount(component);
  });
  it('Card title is Operator Installed', () => {
    mount(component);
    cy.get('.makeStyles-statType-5').should('have.text', 'Operator Installed');
  });
  it('Value conversion is working and plus button is Visible', () => {
    mount(component);
    cy.get('.makeStyles-value-3').should('have.text', '12.3k+');
  });
});

describe('Analytics Card -> Total Experiment Runs', () => {
  const component = (
    <InfoFilled
      color="#858CDD"
      value={64955}
      statType="Total Experiment Runs"
      plus={true}
    />
  );
  it('Stat card is rendered', () => {
    mount(component);
    expect(component.props.value).to.equals(64955);
  });
  it('Card title is Total Experiment Runs', () => {
    mount(component);
    cy.get('.makeStyles-statType-5').should(
      'have.text',
      'Total Experiment Runs'
    );
  });
  it('Value conversion is working and plus button is Visible', () => {
    mount(component);
    cy.get('.makeStyles-value-3').should('have.text', '64.9k+');
  });
});

describe('Analytics Card -> Total Experiments ', () => {
  const component = (
    <InfoFilled
      color="#F6B92B"
      value={32}
      statType="Total Experiments"
      plus={false}
    />
  );
  it('Stat card is rendered', () => {
    mount(component);
    expect(component.props.value).to.equals(32);
  });
  it('Card title is Total Experiments', () => {
    mount(component);
    cy.get('.makeStyles-statType-5').should('have.text', 'Total Experiments');
  });
  it('Value conversion is working and plus button is not visible', () => {
    mount(component);
    cy.get('.makeStyles-value-3').should('have.text', '32');
  });
});

describe('Analytics Card -> Github Stars ', () => {
  const component = (
    <InfoFilled
      color="#BA3B34"
      value={856}
      statType="Github Stars"
      plus={false}
    />
  );
  it('tat card is rendered', () => {
    mount(component);
    expect(component.props.value).to.equals(856);
  });
  it('Card title is Github Stars', () => {
    mount(component);
    cy.get('.makeStyles-statType-5').should('have.text', 'Github Stars');
  });
  it('Value conversion is working and plus button is not visible', () => {
    mount(component);
    cy.get('.makeStyles-value-3').should('have.text', '856');
  });
});
