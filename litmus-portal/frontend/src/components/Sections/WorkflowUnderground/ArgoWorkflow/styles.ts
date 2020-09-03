import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  dagreGraph: {
    width: '100%',
    height: '100%',

    // Styles for nodes
    '& g g.nodes': {
      '& g.node': {
        cursor: 'pointer',
        color: theme.palette.common.white,
        '& rect': {
          rx: '0.2rem',
          ry: '0.2rem',
        },
      },
      '& g.Succeeded': {
        fill: theme.palette.primary.dark,
      },
      '& g.Running': {
        fill: theme.palette.warning.main,
      },
      '& g.Pending': {
        fill: theme.palette.customColors.gray,
      },
      '& g.Failed': {
        fill: theme.palette.error.dark,
      },
      '& g.StepGroup': {
        fill: theme.palette.customColors.gray,
        cursor: 'default',
        '& rect': {
          rx: '0.625rem !important',
          ry: '0.625rem !important',
          transform: 'scale(0.5)',
        },
      },
    },

    // Styles for edges
    '& g g.edgePaths': {
      stroke: theme.palette.customColors.gray,
    },
  },
}));

export default useStyles;
