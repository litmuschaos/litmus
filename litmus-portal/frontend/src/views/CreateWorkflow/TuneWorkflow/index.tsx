import { Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import YamlEditor from '../../../components/YamlEditor/Editor';
import { WorkflowData } from '../../../models/redux/workflow';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import useStyles from './styles';

const TuneWorkflow: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

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
          const parsedYaml = YAML.parse(yamlText);
          delete parsedYaml.metadata.generateName;
          parsedYaml.metadata.name = workflowData.name;
          const nameMappedYaml = YAML.stringify(parsedYaml);
          setYamlFile(nameMappedYaml);
          workflow.setWorkflowDetails({
            name,
            link,
            yaml: nameMappedYaml,
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
          <strong>{t('createWorkflow.tuneWorkflow.header')}</strong>
        </Typography>
        <Typography className={classes.description}>
          {t('createWorkflow.tuneWorkflow.info')}
        </Typography>
        <Typography className={classes.descriptionextended}>
          {t('createWorkflow.tuneWorkflow.infoExtended')}
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
        />
      </div>
    </div>
  );
};

export default TuneWorkflow;
