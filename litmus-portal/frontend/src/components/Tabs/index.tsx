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
        <Box style={{ marginTop: 30, marginLeft: 10 }}>
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
      color: theme.palette.tabsComponentColor,
      fontSize: '0.95rem',
      paddingTop: theme.spacing(1.875),
      paddingBottom: theme.spacing(1.875),
      borderBottom: `1px solid ${theme.palette.customColors.black(0.1)}`,
      '&:focus': {
        opacity: 1,
      },
    },
  })
)((props: StyledTabProps) => <Tab {...props} />);

export { TabPanel, StyledTab };
