import { useMutation, useQuery } from '@apollo/client';
import {
  AccordionDetails,
  IconButton,
  RadioGroup,
  Typography,
  useTheme,
} from '@material-ui/core';
import { LitmusCard, RadioButton, Search } from 'litmus-ui';
import localforage from 'localforage';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DELETE_WORKFLOW_TEMPLATE,
  GET_MANIFEST_TEMPLATE,
} from '../../../graphql';
import {
  GetManifestTemplate,
  GetManifestTemplateArray,
} from '../../../models/graphql/workflowListData';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { getProjectID } from '../../../utils/getSearchParams';
import useStyles from './styles';

interface ChooseWorkflowRadio {
  selected: string;
  id: string;
}

interface ChooseWorkflowFromExistingProps {
  selectedExp: (expID: string) => void;
}

const ChooseWorkflowFromExisting: React.FC<ChooseWorkflowFromExistingProps> = ({
  selectedExp,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { palette } = useTheme();
  // Local States
  const [search, setSearch] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>('');
  const workflowAction = useActions(WorkflowActions);
  const { data: templateData } = useQuery<GetManifestTemplate>(
    GET_MANIFEST_TEMPLATE,
    {
      variables: {
        data: getProjectID(),
      },
      fetchPolicy: 'network-only',
    }
  );

  const [deleteTemplate] = useMutation(DELETE_WORKFLOW_TEMPLATE, {
    refetchQueries: [
      {
        query: GET_MANIFEST_TEMPLATE,
        variables: { data: getProjectID() },
      },
    ],
  });

  const filteredExistingWorkflows: GetManifestTemplateArray[] = templateData
    ? templateData.getManifestTemplate.filter((w: GetManifestTemplateArray) => {
        if (search === null) return w;
        if (w.templateName.toLowerCase().includes(search.toLowerCase()))
          return w;
        return null;
      })
    : [];

  // Methods
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.value);
    const selection: ChooseWorkflowRadio = {
      selected: 'B',
      id: event.target.value,
    };
    selectedExp(selection.id);
    const templateData = filteredExistingWorkflows.filter((workflow) => {
      return workflow.templateID === event.target.value;
    })[0];
    workflowAction.setWorkflowManifest({
      isCustomWorkflow: templateData.isCustomWorkflow,
    });
    localforage.setItem('selectedScheduleOption', selection);
    localforage.setItem('hasSetWorkflowData', false);
  };

  return (
    <AccordionDetails>
      {/* Wrapping content inside the Accordion to take full width */}
      <div style={{ width: '100%' }}>
        <Search
          data-cy="agentSearch"
          id="input-with-icon-textfield"
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {/* Leaving some space between the search and workflow cards */}
        <br />
        <br />

        <div className={classes.predefinedWorkflowDiv}>
          <RadioGroup
            data-cy="templateWorkflowsRadioGroup"
            value={selected}
            onChange={handleChange}
          >
            {filteredExistingWorkflows && filteredExistingWorkflows.length ? (
              filteredExistingWorkflows.map(
                (templateData: GetManifestTemplateArray) => (
                  <LitmusCard
                    width="100%"
                    height="5rem"
                    key={templateData.templateID}
                    borderColor={palette.border.main}
                    className={classes.existingWorkflowCard}
                  >
                    <RadioButton value={templateData.templateID.toString()}>
                      <div id="body">
                        <div id="left-div">
                          <Typography>{templateData.templateName}</Typography>
                        </div>
                        <div id="right-div">
                          <Typography>
                            {templateData.templateDescription}
                          </Typography>
                        </div>
                        <div id="last-div">
                          <div className={classes.lastDivChildren}>
                            <img
                              src="./icons/litmus-icon.svg"
                              alt="Experiment Icon"
                            />
                            <Typography>{templateData.projectName}</Typography>
                          </div>

                          <img
                            src="./icons/templateIcon.svg"
                            alt="template"
                            className={classes.templateIconBg}
                          />
                        </div>
                        <IconButton
                          onClick={() => {
                            deleteTemplate({
                              variables: {
                                projectID: getProjectID(),
                                data: templateData.templateID,
                              },
                            });
                          }}
                          className={classes.deleteButton}
                        >
                          <img
                            alt="delete"
                            src="./icons/deleteBox.svg"
                            height="30"
                          />
                        </IconButton>
                      </div>
                    </RadioButton>
                  </LitmusCard>
                )
              )
            ) : (
              <div className={classes.noTemplatesDiv}>
                <Typography className={classes.noTemplatesText}>
                  <strong>
                    {t('createWorkflow.chooseWorkflow.noTemplates')}
                  </strong>
                </Typography>
                <Typography className={classes.noTemplatesDesc}>
                  {t('createWorkflow.chooseWorkflow.addTemplate')}
                </Typography>
              </div>
            )}
          </RadioGroup>
        </div>
        {/* Bottom Blur */}
        <div className={classes.blur} />
      </div>
    </AccordionDetails>
  );
};
export default ChooseWorkflowFromExisting;
