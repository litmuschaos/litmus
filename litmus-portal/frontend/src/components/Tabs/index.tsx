import { createStyles, Tab, withStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';

interface TabPanelProps {
  index: number;
  value: number;
  style?: Object;
}
// TabPanel is used to implement the functioning of tabs
const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  style,
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={style ?? {}}
    >
      {value === index && children}
    </div>
  );
};
interface StyledTabProps {
  label: string;
  icon?: string | ReactElement;
}
const StyledTab = withStyles((theme) =>
  createStyles({
    root: {
      textTransform: 'none',
      color: theme.palette.text.hint,
      fontSize: '0.95rem',
      paddingTop: theme.spacing(1.875),
      paddingBottom: theme.spacing(1.875),
      borderBottom: `1px solid ${theme.palette.border.main}`,
      '&:focus': {
        opacity: 1,
      },
    },
    selected: {
      color: theme.palette.highlight,
    },
    wrapper: {
      flexDirection: 'row-reverse',
    },
    labelContainer: {
      width: 'auto',
      padding: 0,
    },
  })
)((props: StyledTabProps) => <Tab {...props} />);

export { TabPanel, StyledTab };
