import { Box, createStyles, Tab, withStyles } from '@material-ui/core';
import React from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const TabPanel: React.FC<TabPanelProps> = ({ children, index, value }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box p={3}>
          <>{children}</>
        </Box>
      )}
    </div>
  );
};
interface StyledTabProps {
  label: string;
}
const StyledTab = withStyles((theme) =>
  createStyles({
    root: {
      textTransform: 'none',
      color: 'rgba(0,0,0,0.5)',
      fontSize: '0.95rem',
      paddingTop: theme.spacing(1.875),
      paddingBottom: theme.spacing(1.875),
      width: '15.9375rem',
      '&:focus': {
        opacity: 1,
      },
    },
  })
)((props: StyledTabProps) => <Tab {...props} />);

export { TabPanel, StyledTab };
