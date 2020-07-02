import React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';

interface CustomSchToggleProps {
  label: string;
}

// Toggle button used in schedule workflow component for displaying week days
const CustomSchToggle: React.FC<CustomSchToggleProps> = ({ label }) => {
  return (
    <ToggleButton
      value="sun"
      aria-label="sun"
      style={{
        margin: 10,
        width: '4.4375rem',
        height: '2.75rem',
        fontWeight: 'normal',
        border: '1px solid #D1D2D7',
        borderRadius: 3,
        color: '#000000',
      }}
    >
      {label}
    </ToggleButton>
  );
};
export default CustomSchToggle;
