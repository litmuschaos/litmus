import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from 'utils/testUtils';
import EditableStepName from '../EditableStepName';

const mockShowError = jest.fn();

jest.mock('@harnessio/uicore', () => ({
  ...jest.requireActual('@harnessio/uicore'),
  useToaster: () => ({
    showError: mockShowError,
    showSuccess: jest.fn(),
    showWarning: jest.fn(),
    clear: jest.fn()
  })
}));

describe('EditableStepName', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    faultName: 'pod-delete',
    onSave: mockOnSave
  };

  describe('Display Mode', () => {
    test('renders fault name when no step name is provided', () => {
      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('pod-delete')).toBeInTheDocument();
    });

    test('renders step name when provided', () => {
      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Custom Step Name" />
        </TestWrapper>
      );

      expect(screen.getByText('Custom Step Name')).toBeInTheDocument();
    });

    test('shows subtitle when step name differs from fault name and showSubtitle is true', () => {
      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Custom Step Name" showSubtitle={true} />
        </TestWrapper>
      );

      expect(screen.getByText('Custom Step Name')).toBeInTheDocument();
      expect(screen.getByText('pod-delete')).toBeInTheDocument();
    });

    test('does not show subtitle when step name equals fault name', () => {
      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="pod-delete" showSubtitle={true} />
        </TestWrapper>
      );

      const podDeleteElements = screen.getAllByText('pod-delete');
      // Should only render once, not as subtitle
      expect(podDeleteElements).toHaveLength(1);
    });

    test('does not show subtitle when showSubtitle is false', () => {
      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Custom Step Name" showSubtitle={false} />
        </TestWrapper>
      );

      expect(screen.getByText('Custom Step Name')).toBeInTheDocument();
      expect(screen.queryByText('pod-delete')).not.toBeInTheDocument();
    });

    test('renders edit button when not disabled', () => {
      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} disabled={false} />
        </TestWrapper>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('does not render edit button when disabled', () => {
      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} disabled={true} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    test('enters edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Custom Step Name" />
        </TestWrapper>
      );

      const editButton = screen.getByRole('button');
      await user.click(editButton);

      const input = screen.getByDisplayValue('Custom Step Name');
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    test('displays current step name in input field', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Test Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));

      expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
    });

    test('displays fault name when no step name is provided', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));

      expect(screen.getByDisplayValue('pod-delete')).toBeInTheDocument();
    });

    test('renders save and cancel buttons in edit mode', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));

      const buttons = screen.getAllByRole('button');
      // Should have 2 buttons: save (tick) and cancel (cross)
      expect(buttons).toHaveLength(2);
    });
  });

  describe('Save Functionality', () => {
    test('calls onSave with trimmed value when save button is clicked', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Old Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Old Name');
      await user.clear(input);
      await user.type(input, '  New Name  ');

      const buttons = screen.getAllByRole('button');
      const saveButton = buttons[0]; // tick button
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('New Name');
      });
    });

    test('calls onSave when Enter key is pressed', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Old Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Old Name');
      await user.clear(input);
      await user.type(input, 'New Name{Enter}');

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('New Name');
      });
    });

    test('exits edit mode after successful save', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Old Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Old Name');
      await user.clear(input);
      await user.type(input, 'New Name{Enter}');

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });

    test('does not call onSave when value is unchanged', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Same Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));

      const buttons = screen.getAllByRole('button');
      const saveButton = buttons[0];
      await user.click(saveButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('does not call onSave when value is empty or whitespace only', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Name');
      await user.clear(input);
      await user.type(input, '   ');

      const buttons = screen.getAllByRole('button');
      const saveButton = buttons[0];
      await user.click(saveButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('shows error toast when save fails', async () => {
      const user = userEvent.setup();
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Old Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Old Name');
      await user.clear(input);
      await user.type(input, 'New Name{Enter}');

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith('Failed to update step name');
      });
    });

    test('remains in edit mode when save fails', async () => {
      const user = userEvent.setup();
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Old Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Old Name');
      await user.clear(input);
      await user.type(input, 'New Name{Enter}');

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalled();
      });

      // Should still be in edit mode
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('disables inputs and buttons while saving', async () => {
      const user = userEvent.setup();
      let resolveSave: () => void;
      const savePromise = new Promise<void>(resolve => {
        resolveSave = resolve;
      });
      mockOnSave.mockReturnValue(savePromise);

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Old Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Old Name');
      await user.clear(input);
      await user.type(input, 'New Name');

      const buttons = screen.getAllByRole('button');
      const saveButton = buttons[0];
      await user.click(saveButton);

      // Check that input and buttons are disabled
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeDisabled();
        buttons.forEach(button => {
          expect(button).toBeDisabled();
        });
      });

      // Resolve the promise
      resolveSave!();
    });
  });

  describe('Cancel Functionality', () => {
    test('exits edit mode when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Test Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons[1]; // cross button
      await user.click(cancelButton);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('Test Name')).toBeInTheDocument();
    });

    test('exits edit mode when Escape key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Test Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Test Name');
      await user.type(input, '{Escape}');

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('Test Name')).toBeInTheDocument();
    });

    test('does not call onSave when cancelled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Old Name" />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Old Name');
      await user.clear(input);
      await user.type(input, 'New Name');

      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons[1];
      await user.click(cancelButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('resets input value when cancelled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EditableStepName {...defaultProps} stepName="Original Name" />
        </TestWrapper>
      );

      // Enter edit mode and change value
      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Original Name');
      await user.clear(input);
      await user.type(input, 'Changed Name');

      // Cancel
      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons[1];
      await user.click(cancelButton);

      // Re-enter edit mode
      await user.click(screen.getByRole('button'));

      // Should show original name, not the changed one
      expect(screen.getByDisplayValue('Original Name')).toBeInTheDocument();
    });
  });

  describe('Event Propagation', () => {
    test('prevents Escape key event from propagating to parent', async () => {
      const user = userEvent.setup();
      const parentKeyDownHandler = jest.fn();

      render(
        <TestWrapper>
          <div onKeyDown={parentKeyDownHandler}>
            <EditableStepName {...defaultProps} stepName="Test Name" />
          </div>
        </TestWrapper>
      );

      // Enter edit mode
      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Test Name');

      // Press Escape
      await user.type(input, '{Escape}');

      // Check that Escape key press was not propagated to parent
      const escapeKeyCalls = parentKeyDownHandler.mock.calls.filter(call => call[0].key === 'Escape');
      expect(escapeKeyCalls).toHaveLength(0);

      // Edit mode should be exited
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    test('prevents Enter key event from propagating to parent', async () => {
      const user = userEvent.setup();
      const parentKeyDownHandler = jest.fn();
      mockOnSave.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <div onKeyDown={parentKeyDownHandler}>
            <EditableStepName {...defaultProps} stepName="Old Name" />
          </div>
        </TestWrapper>
      );

      // Enter edit mode
      await user.click(screen.getByRole('button'));
      const input = screen.getByDisplayValue('Old Name');
      await user.clear(input);
      await user.type(input, 'New Name{Enter}');

      // Check that Enter key press was not propagated to parent
      const enterKeyCalls = parentKeyDownHandler.mock.calls.filter(call => call[0].key === 'Enter');
      expect(enterKeyCalls).toHaveLength(0);

      // Save should be called
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('New Name');
      });
    });
  });
});
