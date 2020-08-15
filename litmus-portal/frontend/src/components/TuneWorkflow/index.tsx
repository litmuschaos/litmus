import React, { useState, useEffect } from 'react';
import { Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import { useSelector } from 'react-redux';
import useStyles from './styles';
import { WorkflowData } from '../../models/workflow';
import { RootState } from '../../redux/reducers';
import useActions from '../../redux/actions';
import * as WorkflowActions from '../../redux/actions/workflow';
import Loader from '../Loader';
import YamlEditor from '../YamlEditor/Editor';

const TuneWorkflow: React.FC = () => {
  const classes = useStyles();

  const workflowData: WorkflowData = useSelector(
    (state: RootState) => state.workflowData
  );

  const workflow = useActions(WorkflowActions);

  const { name, link, yaml, id, description } = workflowData;

  const [isLoading, loadStateChanger] = useState(true);

  const [yamlFile, setYamlFile] = useState(`${link}`);

  function fetchYaml(link: string) {
    fetch(link)
      .then((data) => {
        data.text().then((yamlText) => {
          setYamlFile(yamlText);
          workflow.setWorkflowDetails({
            name,
            link,
            yaml: yamlText,
            id,
            description,
          });
          loadStateChanger(false);
        });
      })
      .catch((err) => {
        console.error(`Unable to fetch the yaml text${err}`);
      });
  }

  useEffect(() => {
    if (yaml === 'none' || yaml === '') {
      fetchYaml(link);
    } else {
      setYamlFile(yaml);
      loadStateChanger(false);
    }
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.tuneDiv}>
        <Typography className={classes.heading}>
          <strong>Tune the selected workflow</strong>
        </Typography>
        <Typography className={classes.description}>
          The following tests are run in sequence. The sequence of tests cannot
          be changed.
        </Typography>
        <Typography className={classes.descriptionextended}>
          Select the tests you want to keep in the workflow and adjust the
          variables in the selected test.
        </Typography>
      </div>

      <Divider variant="middle" className={classes.horizontalLine} />

      <div className={classes.editorfix}>
        <YamlEditor
          content={yamlFile}
          filename={name}
          yamlLink={link}
          id={id}
          description={description}
          readOnly={false}
          optionsDisplay
        />
      </div>
    </div>
  );
};

export default TuneWorkflow;
