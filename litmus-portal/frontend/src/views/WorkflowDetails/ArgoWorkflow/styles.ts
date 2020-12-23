import { makeStyles, Theme } from '@material-ui/core/styles';

interface StyleProps {
  horizontal: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  // Graph options
  graphOptions: {
    color: theme.palette.text.disabled,
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
  layoutButton: {
    minWidth: 0,
    borderColor: theme.palette.text.hint,
    marginRight: theme.spacing(2),
    '& svg': {
      fill: theme.palette.text.disabled,
    },
  },

  // Workflow Graph
  dagreGraph: {
    width: '100%',
    height: '90%',
    cursor: 'grab',

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
        transformOrigin: '6.05px 6.55px',
        animation: 'runningNodeSpinAnimation 2s ease-in-out infinite',
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
        '& rect': {
          x: -1.5,
          y: -1.5,
          width: '0.2rem',
          height: '0.2rem',
          rx: '0.625rem !important',
          ry: '0.625rem !important',
        },
      },
      '& g.StepGroup.Succeeded': {
        fill: theme.palette.primary.dark,
      },
      '& g.StepGroup.Running': {
        fill: theme.palette.warning.main,
      },
      '& g.StepGroup.Pending': {
        fill: theme.palette.customColors.gray,
      },
      '& g.StepGroup.Failed': {
        fill: theme.palette.error.dark,
      },
    },

    // Styles for edges
    '& g g.edgePaths': {
      '& g.Succeeded': {
        fill: theme.palette.primary.dark,
        stroke: theme.palette.primary.dark,
      },
      '& g.Running': {
        fill: theme.palette.warning.main,
        stroke: theme.palette.warning.main,
      },
      '& g.Pending': {
        fill: theme.palette.customColors.gray,
        stroke: theme.palette.customColors.gray,
      },
      '& g.Failed': {
        fill: theme.palette.error.dark,
        stroke: theme.palette.error.dark,
      },
    },
  },
  '@global': {
    '@keyframes runningNodeSpinAnimation': {
      from: {
        transform: (props: StyleProps) =>
          `scale(1.5) translate(-4px, ${
            props.horizontal ? -4.3 : -1
          }px) rotate(0deg)`,
      },
      to: {
        transform: (props: StyleProps) =>
          `scale(1.5) translate(-4px, ${
            props.horizontal ? -4.3 : -1
          }px) rotate(360deg)`,
      },
    },
  },
}));

export default useStyles;
