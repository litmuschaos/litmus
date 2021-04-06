/* eslint-disable jsx-a11y/no-static-element-interactions */
import { IconButton, Typography } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChaosEventDetails } from '../../../../models/dashboardsData';
import ChaosTable from '../ChaosTable';
import useStyles, {
  Accordion,
  AccordionSummary,
  StyledAccordionDetails,
} from './styles';

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
        aria-controls="panel1a-content"
        id="panel1a-header"
        className={classes.accordionSummary}
        key={`chaos-table-${dashboardKey}`}
      >
        <div
          onClick={() => {
            setChaosTableOpen(!chaosTableOpen);
          }}
          onKeyDown={() => {
            setChaosTableOpen(!chaosTableOpen);
          }}
          className={classes.accordionHeader}
        >
          {!chaosTableOpen ? (
            <ArrowDropDownIcon className={classes.tableDropIcon} />
          ) : (
            <ArrowDropUpIcon className={classes.tableDropIcon} />
          )}
          <Typography className={classes.chaosHelperText}>
            {!chaosTableOpen
              ? `${t(
                  'analyticsDashboard.monitoringDashboardPage.chaosTable.showTable'
                )}`
              : `${t(
                  'analyticsDashboard.monitoringDashboardPage.chaosTable.hideTable'
                )}`}
          </Typography>
        </div>
        <IconButton
          aria-label="edit chaos query"
          aria-haspopup="true"
          disabled
          data-cy="editChaosQueryButton"
          className={classes.editIconButton}
        >
          <img src="/icons/editIcon.svg" alt="Edit" />
        </IconButton>
      </AccordionSummary>
      <StyledAccordionDetails className={classes.accordionDetails}>
        <ChaosTable
          chaosList={chaosEventsToBeShown}
          selectEvents={(selectedEvents: string[]) => {
            postEventSelectionRoutine(selectedEvents);
          }}
        />
      </StyledAccordionDetails>
    </Accordion>
  );
};

export default ChaosAccordion;
