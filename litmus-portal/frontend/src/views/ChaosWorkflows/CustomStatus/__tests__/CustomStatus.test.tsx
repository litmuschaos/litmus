/* eslint-disable */
import '@testing-library/jest-dom';
import React from 'react';
import { render } from '../../../../testHelpers/test-util';
import CustomStatus from '../Status';

/**
 * Test to check the custom status
 */
describe('Custom Status', () => {
  it('Renders Succeeded Status', () => {
    const { getByTestId } = render(<CustomStatus status="Succeeded" />);
    const status = getByTestId('status');

    expect(status).toBeTruthy;
    expect(status!.innerHTML).toEqual(
      'workflowDetailsView.workflowInfo.Completed'
    );
  });
  it('Renders Running Status', () => {
    const { getByTestId } = render(<CustomStatus status="Running" />);
    const status = getByTestId('status');

    expect(status).toBeTruthy;
    expect(status!.innerHTML).toEqual('Running');
  });
  it('Renders Failed Status', () => {
    const { getByTestId } = render(<CustomStatus status="Failed" />);
    const status = getByTestId('status');

    expect(status).toBeTruthy;
    expect(status!.innerHTML).toEqual('Failed');
  });
});
