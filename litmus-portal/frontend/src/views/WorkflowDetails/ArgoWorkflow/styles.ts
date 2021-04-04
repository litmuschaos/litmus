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
    borderColor: theme.palette.text.hint,
    marginRight: theme.spacing(2),
    minWidth: 0,
    '& svg': {
      fill: theme.palette.text.disabled,
    },
  },

  // Workflow Graph
  dagreGraph: {
    cursor: 'grab',
    height: '90%',
    width: '100%',

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
        animation: 'runningNodeSpinAnimation 2s ease-in-out infinite',
        transformOrigin: '6.05px 6.55px',
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
          fill: theme.palette.success.main,
        },
        '& circle.selected': {
          fill: 'none',
          stroke: theme.palette.success.main,
          strokeDasharray: '5,2',
          strokeWidth: '1.5',
        },
      },
      '& g.Running': {
        '& circle': {
          fill: theme.palette.highlight,
        },
        '& circle.selected': {
          fill: 'none',
          stroke: theme.palette.highlight,
          strokeDasharray: '5,2',
          strokeWidth: '1.5',
        },
      },
      '& g.Pending': {
        '& circle': {
          fill: theme.palette.horizontalStepper.completed,
        },
        '& circle.selected': {
          fill: 'none',
          stroke: theme.palette.horizontalStepper.completed,
          strokeDasharray: '5,2',
          strokeWidth: '1.5',
        },
      },
      '& g.Failed': {
        '& circle': {
          fill: theme.palette.status.failed.text,
        },
        '& circle.selected': {
          fill: 'none',
          stroke: theme.palette.status.failed.text,
          strokeDasharray: '5,2',
          strokeWidth: '1.5',
        },
      },
      '& g.StepGroup': {
        cursor: 'default',
        fill: theme.palette.status.completed.text,
        '& rect': {
          height: '0.2rem',
          rx: '0.625rem !important',
          ry: '0.625rem !important',
          width: '0.2rem',
          x: '-1.5px',
          y: '-1.5px',
        },
      },
    },

    // Styles for edges
    '& g g.edgePaths': {
      '& g.link': {
        fill: theme.palette.status.completed.text,
        stroke: theme.palette.status.completed.text,
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
