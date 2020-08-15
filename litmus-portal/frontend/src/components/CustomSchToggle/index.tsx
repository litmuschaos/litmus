import React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import useStyles from './styles';

interface CustomSchToggleProps {
  label: string;
}

// Toggle button used in schedule workflow component for displaying week days
const CustomSchToggle: React.FC<CustomSchToggleProps> = ({ label }) => {
  const classes = useStyles();
  return (
    <ToggleButton className={classes.toggle} value="sun" aria-label="sun">
      {label}
    </ToggleButton>
  );
};
export default CustomSchToggle;
