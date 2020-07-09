import React from 'react';
import { TextField } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';

interface CustomTextProps {
  value: string;
  id: string;
  width: number;
}

// Editable text field used to edit and save the input in the text box
const CustomText: React.FC<CustomTextProps> = ({ value, id, width }) => {
  const [isDisabled, setIsDisabled] = React.useState(true);

  const handleEdit = () => {
    setIsDisabled(false);
  };
  const handleSave = () => {
    setIsDisabled(true);
  };
  return (
    <div>
      <TextField
        disabled={isDisabled}
        id={id}
        defaultValue={value}
        multiline
        rowsMax={6}
        InputProps={{
          disableUnderline: true,
          style: {
            width,
            color: 'rgba(0,0,0)',
            lineHeight: '1.5rem',
            fontSize: '1rem',
          },
        }}
      />
      {isDisabled ? (
        <EditIcon onClick={handleEdit} />
      ) : (
        <SaveIcon onClick={handleSave} />
      )}
    </div>
  );
};
export default CustomText;
