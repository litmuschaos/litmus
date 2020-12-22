import { makeStyles, Theme } from '@material-ui/core/styles';

interface StyleProps {
  horizontal: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  dagreGraph: {
    width: '100%',
    height: '90%',

    // Styles for nodes
    '& g g.nodes': {
      '& g.node': {
        cursor: 'pointer',
        fill: 'none',
        '& g.label g': {
          transform: (props: StyleProps) =>
            props.horizontal ? 'translate(0, 0)' : 'translate(0, -5px)',
          '& path': {
            fill: theme.palette.common.white,
          },
        },
        '& text': {
          fill: theme.palette.text.primary,
        },
      },
      '& path.pendingIcon': {
        transform: (props: StyleProps) =>
          `scale(1.8) translate(-5px, ${props.horizontal ? -5.6 : -2.8}px)`,
      },
      '& path.runningIcon': {
        transform: (props: StyleProps) =>
          `scale(1.5) translate(-6px, ${props.horizontal ? -6.5 : -3.2}px)`,
      },
      '& path.succeededIcon': {
        transform: (props: StyleProps) =>
          `scale(1.8) translate(-5px, ${props.horizontal ? -3.6 : -1}px)`,
      },
      '& path.failedIcon': {
        transform: (props: StyleProps) =>
          `scale(1.5) translate(-5px, ${props.horizontal ? -5.5 : -2.5}px)`,
      },
      '& g.Succeeded': {
        '& circle': {
          fill: theme.palette.primary.dark,
        },
      },
      '& g.Running': {
        '& circle': {
          fill: theme.palette.warning.main,
        },
      },
      '& g.Pending': {
        '& circle': {
          fill: theme.palette.customColors.gray,
        },
      },
      '& g.Failed': {
        '& circle': {
          fill: theme.palette.error.dark,
        },
      },
      '& g.StepGroup': {
        fill: theme.palette.customColors.gray,
        cursor: 'default',
        '& rect': {
          x: -1.5,
          y: -1.5,
          width: '0.2rem',
          height: '0.2rem',
          rx: '0.625rem !important',
          ry: '0.625rem !important',
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
