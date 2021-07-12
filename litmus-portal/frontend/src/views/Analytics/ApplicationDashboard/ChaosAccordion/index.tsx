import { IconButton, Typography, withStyles } from '@material-ui/core';
import MuiAccordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import { TextButton } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChaosEventDetails } from '../../../../models/dashboardsData';
import ChaosTable from '../ChaosTable';
import useStyles from './styles';

const Accordion = withStyles((theme) => ({
  root: {
    border: 0,
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
    '& .MuiAccordionSummary-root.Mui-expanded': {
      cursor: 'default',
      minHeight: '1rem !important',
      height: '2.75rem',
      paddingTop: theme.spacing(0.5),
    },
    '& .MuiAccordionSummary-root': {
      cursor: 'default',
      minHeight: '1rem !important',
      height: '2.75rem',
      paddingTop: theme.spacing(0.5),
    },
    '& .MuiButtonBase-root:hover': {
      cursor: 'default',
    },
  },
  expanded: {},
}))(MuiAccordion);

const AccordionSummary = withStyles({
  content: {
    flexGrow: 0,
  },
})(MuiAccordionSummary);

const StyledAccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 0, 1),
  },
}))(AccordionDetails);

interface ChaosAccordionProps {
  dashboardKey: string;
  chaosEventsToBeShown: ChaosEventDetails[];
  postEventSelectionRoutine: (selectedEvents: string[]) => void;
}

const ChaosAccordion: React.FC<ChaosAccordionProps> = ({
  dashboardKey,
  chaosEventsToBeShown,
  postEventSelectionRoutine,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [chaosTableOpen, setChaosTableOpen] = React.useState<boolean>(false);

  return (
    <Accordion expanded={chaosTableOpen}>
      <AccordionSummary
        aria-controls="chaos-table-content"
        id="chaos-table-header"
        className={classes.accordionSummary}
        key={`chaos-table-${dashboardKey}`}
      >
        <TextButton
          className={classes.button}
          onClick={() => setChaosTableOpen(!chaosTableOpen)}
          variant="highlight"
          startIcon={
            !chaosTableOpen ? (
              <ArrowDropDownIcon className={classes.tableDropIcon} />
            ) : (
              <ArrowDropUpIcon className={classes.tableDropIcon} />
            )
          }
        >
          <Typography className={classes.chaosHelperText}>
            {!chaosTableOpen
              ? t(
                  'analyticsDashboard.monitoringDashboardPage.chaosTable.showTable'
                )
              : t(
                  'analyticsDashboard.monitoringDashboardPage.chaosTable.hideTable'
                )}
          </Typography>
        </TextButton>
        <IconButton
          aria-label="edit chaos query"
          aria-haspopup="true"
          disabled
          data-cy="editChaosQueryButton"
          className={classes.editIconButton}
        >
          <img src="./icons/editIcon.svg" alt="Edit" />
        </IconButton>
      </AccordionSummary>
      <StyledAccordionDetails className={classes.accordionDetails}>
        <ChaosTable
          chaosList={chaosEventsToBeShown}
          selectEvents={(selectedEvents: string[]) =>
            postEventSelectionRoutine(selectedEvents)
          }
        />
      </StyledAccordionDetails>
    </Accordion>
  );
};

export default ChaosAccordion;
