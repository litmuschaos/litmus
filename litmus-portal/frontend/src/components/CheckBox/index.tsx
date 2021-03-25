import { Checkbox, withStyles } from '@material-ui/core';

const CheckBox = withStyles((theme) => ({
  root: {
    color: theme.palette.text.hint,
  },
}))(Checkbox);

export default CheckBox;
