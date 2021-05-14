import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  dragdropDiv: {
    height: '22.5rem',
    overflowY: 'scroll',
  },
  droppableDiv: {
    display: 'flex',
    minHeight: '2.5rem',
    padding: theme.spacing(2.5),
    backgroundColor: theme.palette.cards.header,
    borderBottom: `2px solid ${theme.palette.common.white}`,
  },
  expImg: {
    width: '1.25rem',
    height: '1.25rem',
  },
  draggableDiv: {
    width: '100%',
  },
  expName: {
    fontSize: '0.85rem',
  },
  sequencingHeader: {
    color: theme.palette.text.hint,
    fontSize: '0.75rem',
    marginTop: theme.spacing(5),
    textAlign: 'left',
  },
  sequencingDesc: {
    color: theme.palette.text.hint,
    fontSize: '0.75rem',
    marginTop: theme.spacing(1.25),
    textAlign: 'left',
  },
  buttonDiv: {
    width: 'fit-content',
    marginTop: theme.spacing(2.5),
    marginLeft: 'auto',
    justifyContent: 'space-between',
  },
  discard: {
    marginRight: theme.spacing(2.5),
  },
}));

export default useStyles;
