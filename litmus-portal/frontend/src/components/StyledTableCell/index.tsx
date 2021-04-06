import { createStyles, TableCell, withStyles } from '@material-ui/core';

export const StyledTableCell = withStyles((theme) =>
  createStyles({
    root: {
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  })
)(TableCell);
