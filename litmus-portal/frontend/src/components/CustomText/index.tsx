import { IconButton, makeStyles, TextField, Theme } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import React from 'react';

interface CustomTextProps {
  value: string;
  id: string;
  onchange: (val: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  editBtn: {
    color: theme.palette.common.black,
  },
  saveBtn: {
    color: theme.palette.common.black,
  },
  inputText: {
    width: '40.75rem',
    paddingTop: theme.spacing(0.375),
  },
}));

// Editable text field used to edit and save the input in the text box
const CustomText: React.FC<CustomTextProps> = ({ value, id, onchange }) => {
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

  const classes = useStyles();
  return (
    <div>
      <TextField
        data-cy="text"
        className={classes.inputText}
        disabled={isDisabled}
        id={id}
        defaultValue={newValue}
        multiline
        InputProps={{
          disableUnderline: true,
          style: {
            color: 'rgba(0,0,0)',
            lineHeight: '1rem',
            fontSize: '1rem',
          },
        }}
        onChange={handleChange}
      />
      {isDisabled ? (
        <IconButton size="medium" onClick={handleEdit}>
          <EditIcon className={classes.editBtn} data-cy="edit" />
        </IconButton>
      ) : (
        <IconButton size="medium" onClick={handleSave}>
          <SaveIcon className={classes.saveBtn} data-cy="save" />
        </IconButton>
      )}
    </div>
  );
};
export default CustomText;
