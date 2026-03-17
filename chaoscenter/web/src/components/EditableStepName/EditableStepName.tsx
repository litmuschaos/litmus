import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { Button, ButtonSize, ButtonVariation, Text, TextInput, useToaster } from '@harnessio/uicore';
import css from './EditableStepName.module.scss';

export interface EditableStepNameProps {
  stepName?: string;
  faultName: string;
  onSave: (newStepName: string) => Promise<void>;
  fontSize?: FontVariation;
  showSubtitle?: boolean;
  disabled?: boolean;
}

export function EditableStepName({
  stepName,
  faultName,
  onSave,
  fontSize = FontVariation.H5,
  showSubtitle = true,
  disabled = false
}: EditableStepNameProps): React.ReactElement {
  const { showError } = useToaster();
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [editedValue, setEditedValue] = React.useState<string>('');
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const displayName = stepName || faultName;
  const shouldShowSubtitle = showSubtitle && stepName && stepName !== faultName;

  const handleEditStart = (): void => {
    setEditedValue(displayName);
    setIsEditing(true);
  };

  const handleSave = async (): Promise<void> => {
    if (editedValue.trim() && editedValue !== stepName) {
      setIsSaving(true);
      try {
        await onSave(editedValue.trim());
        setIsEditing(false);
        setEditedValue('');
      } catch (error) {
        showError('Failed to update step name');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(false);
      setEditedValue('');
    }
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setEditedValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={css.editMode}>
        <TextInput
          wrapperClassName={css.stepNameTextInput}
          value={editedValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={isSaving}
        />
        <Button
          variation={ButtonVariation.ICON}
          icon="tick"
          size={ButtonSize.SMALL}
          onClick={handleSave}
          disabled={isSaving}
          loading={isSaving}
        />
        <Button
          variation={ButtonVariation.ICON}
          icon="cross"
          size={ButtonSize.SMALL}
          onClick={handleCancel}
          disabled={isSaving}
        />
      </div>
    );
  }

  return (
    <div className={css.displayMode}>
      <div className={css.stepNameTextContainer}>
        <Text font={{ variation: fontSize }}>{displayName}</Text>
        {shouldShowSubtitle && (
          <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL, italic: true }}>
            {faultName}
          </Text>
        )}
      </div>
      {!disabled && (
        <Button
          variation={ButtonVariation.ICON}
          icon="Edit"
          size={ButtonSize.SMALL}
          onClick={handleEditStart}
          minimal
        />
      )}
    </div>
  );
}

export default EditableStepName;
