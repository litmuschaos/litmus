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
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  DELETE_WORKFLOW_TEMPLATE,
  LIST_MANIFEST_TEMPLATE,
} from '../../../graphql';
import {
  ListManifestTemplate,
  ListManifestTemplateArray,
} from '../../../models/graphql/workflowListData';
import { getProjectID } from '../../../utils/getSearchParams';
import useStyles from './styles';

interface ChooseWorkflowRadio {
  selected: string;
  id: string;
}

const ChooseWorkflowFromExisting = forwardRef((_, ref) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { palette } = useTheme();
  // Local States
  const [search, setSearch] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>('');

  const { data: templateData } = useQuery<ListManifestTemplate>(
    LIST_MANIFEST_TEMPLATE,
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
        query: LIST_MANIFEST_TEMPLATE,
        variables: { data: getProjectID() },
      },
    ],
  });

  const filteredExistingWorkflows: ListManifestTemplateArray[] = templateData
    ? templateData.ListManifestTemplate.filter(
        (w: ListManifestTemplateArray) => {
          if (search === null) return w;
          if (w.template_name.toLowerCase().includes(search.toLowerCase()))
            return w;
          return null;
        }
      )
    : [];

  // Methods
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.value);
    const selection: ChooseWorkflowRadio = {
      selected: 'B',
      id: event.target.value,
    };
    const templateData = filteredExistingWorkflows.filter((workflow) => {
      return workflow.template_id === event.target.value;
    })[0];

    localforage.setItem('selectedScheduleOption', selection);
    localforage.setItem('workflow', {
      name: templateData.template_name.toLowerCase(),
      description: templateData.template_description,
      icon: './avatars/litmus.svg',
      CRDLink: templateData.template_id,
    });
    localforage.setItem('hasSetWorkflowData', true);
  };

  // Selects Option B -> Sub Experiment Options which was already selected by the user
  useEffect(() => {
    localforage
      .getItem('selectedScheduleOption')
      .then((value) =>
        value !== null
          ? setSelected((value as ChooseWorkflowRadio).id)
          : setSelected('')
      );
  }, []);

  function onNext() {
    if (selected === '' || selected === undefined) {
      return false;
    }
    return true;
  }

  useImperativeHandle(ref, () => ({
    onNext,
  }));

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
          <RadioGroup value={selected} onChange={handleChange}>
            {filteredExistingWorkflows && filteredExistingWorkflows.length ? (
              filteredExistingWorkflows.map(
                (templateData: ListManifestTemplateArray) => (
                  <LitmusCard
                    width="100%"
                    height="5rem"
                    key={templateData.template_id}
                    borderColor={palette.border.main}
                    className={classes.existingWorkflowCard}
                  >
                    <RadioButton value={templateData.template_id.toString()}>
                      <div id="body">
                        <div id="left-div">
                          <Typography>{templateData.template_name}</Typography>
                        </div>
                        <div id="right-div">
                          <Typography>
                            {templateData.template_description}
                          </Typography>
                        </div>
                        <div id="last-div">
                          <div className={classes.lastDivChildren}>
                            <img
                              src="./icons/litmus-icon.svg"
                              alt="Experiment Icon"
                            />
                            <Typography>{templateData.project_name}</Typography>
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
                              variables: { data: templateData.template_id },
                            });
                          }}
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
});
export default ChooseWorkflowFromExisting;
