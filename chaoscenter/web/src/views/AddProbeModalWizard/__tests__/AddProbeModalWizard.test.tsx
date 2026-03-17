import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from 'utils/testUtils';
import AddProbeModalWizardView from 'views/AddProbeModalWizard/AddProbeModalWizard';
import { ProbeType, InfrastructureType } from 'api/entities';
import '@testing-library/jest-dom';

jest.mock('react-monaco-editor', () => ({
  __esModule: true,
  default: () => <div>Monaco Mock</div>,
  monaco: {}
}));

jest.mock('monaco-yaml', () => ({
  configureMonacoYaml: jest.fn()
}));

const mockMutation = {
  addKubernetesHTTPProbeMutation: jest.fn(),
  addKubernetesCMDProbeMutation: jest.fn(),
  addPROMProbeMutation: jest.fn(),
  addK8SProbeMutation: jest.fn(),
  updateProbeMutation: jest.fn()
};

const mockValidateName = jest.fn(() => Promise.resolve({ data: { validateUniqueProbe: true } } as any));

describe('AddProbeModalWizardView CMD Probe', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(key => {
          if (key === 'probeType') return ProbeType.CMD;
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  test('textarea should accept long input > 1024 chars', async () => {
    const user = userEvent.setup();
    const { container, getByText } = render(
      <TestWrapper>
        <AddProbeModalWizardView
          hideDarkModal={jest.fn()}
          mutation={mockMutation}
          validateName={mockValidateName}
          loading={false}
          infrastructureType={InfrastructureType.KUBERNETES}
          error={undefined}
        />
      </TestWrapper>
    );

    // Step 1: Overview
    const nameInput = container.querySelector('input[name="name"]');
    if (!nameInput) throw new Error('Name input not found');
    await user.type(nameInput, 'test-val-probe');

    // Click Configure Properties
    const nextButton1 = getByText('configureProperties');
    await user.click(nextButton1);

    // Step 2: Properties
    // Wait for content specific to Step 2
    await waitFor(() => getByText('timeout'));

    const timeoutInput = container.querySelector('input[name$="probeTimeout"]');
    if (!timeoutInput) throw new Error('Timeout input not found');
    await user.clear(timeoutInput);
    await user.type(timeoutInput, '1s');

    const intervalInput = container.querySelector('input[name$="interval"]');
    if (!intervalInput) throw new Error('Interval input not found');
    await user.clear(intervalInput);
    await user.type(intervalInput, '1s');

    const nextButton2 = getByText('configureDetails');
    await user.click(nextButton2);

    // Step 3: Details (CMD Probe)
    await waitFor(() => getByText('Command'));

    const commandInput = container.querySelector('textarea[name$="command"]');
    if (!commandInput) throw new Error('Command input not found');

    expect(commandInput).toHaveAttribute('maxLength', '100000');

    const longString = 'a'.repeat(2000);
    // Use fireEvent for instant change, although user.paste relies on clipboard
    fireEvent.change(commandInput, { target: { value: longString } });
    expect(commandInput).toHaveValue(longString);
  });
});
