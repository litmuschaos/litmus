import { TextField } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import React from 'react';

interface CustomTextProps {
  value: string;
  id: string;
  width: number;
  onchange: (val: string) => void;
}

// Editable text field used to edit and save the input in the text box
const CustomText: React.FC<CustomTextProps> = ({
  value,
  id,
  width,
  onchange,
}) => {
  const [isDisabled, setIsDisabled] = React.useState(true);
  const [newValue, setNewValue] = React.useState<string>(value);

  const handleEdit = () => {
    setIsDisabled(false);
  };
  const handleSave = () => {
    onchange(newValue);
    setIsDisabled(true);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewValue(event.target.value);
  };
  return (
    <div>
      <TextField
        data-cy="text"
        disabled={isDisabled}
        id={id}
        defaultValue={newValue}
        multiline
        rowsMax={6}
        InputProps={{
          disableUnderline: true,
          style: {
            width,
            color: 'rgba(0,0,0)',
            lineHeight: '1rem',
            fontSize: '1rem',
          },
        }}
        onChange={handleChange}
      />
      {isDisabled ? (
        <EditIcon onClick={handleEdit} data-cy="edit" />
      ) : (
        <SaveIcon onClick={handleSave} data-cy="save" />
      )}
    </div>
  );
};
export default CustomText;
