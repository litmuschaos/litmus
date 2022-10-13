import { Typography } from '@material-ui/core';
import localforage from 'localforage';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowDetailsProps } from '../../../models/localforage/workflow';
import { experimentMap } from '../../../models/redux/workflow';
import WeightSlider from '../WeightSlider';
import useStyles from './styles';

const ReliablityScore = forwardRef((_, ref) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [workflowName, setWorkflowName] = useState('');
  const [weights, setWeights] = useState<experimentMap[]>([
    {
      experimentName: '',
      weight: 0,
    },
  ]);

  function handleChange({
    newValue,
    index,
  }: {
    newValue: number;
    index: number;
  }) {
    weights[index].weight = newValue;
    setWeights([...weights]);
  }

  useEffect(() => {
    localforage
      .getItem('weights')
      .then((value) =>
        value !== null ? setWeights(value as experimentMap[]) : setWeights([])
      );
    localforage.getItem('workflow').then((wfDetails) => {
      if (wfDetails) {
        setWorkflowName((wfDetails as WorkflowDetailsProps).name);
      }
    });
  }, []);

  function onNext() {
    localforage.setItem('weights', weights);
    return true;
  }

  useImperativeHandle(ref, () => ({
    onNext,
  }));

  return (
    <div>
      <form className={classes.root}>
        <div className={classes.innerContainer}>
          <div>
            <Typography className={classes.headerText}>
              <strong>{t('createWorkflow.reliabilityScore.header')}</strong>
            </Typography>
            <Typography className={classes.description}>
              {t('createWorkflow.reliabilityScore.info')} {weights.length}{' '}
              {t('createWorkflow.reliabilityScore.tests')} {`"${workflowName}"`}{' '}
              {t('createWorkflow.reliabilityScore.infoNext')}{' '}
            </Typography>
          </div>
          <hr className={classes.horizontalLine} />
          {weights.map((Data: experimentMap, index: number) => (
            <WeightSlider
              key={Data.experimentName + index.toString()}
              index={index}
              testName={Data.experimentName}
              weight={Data.weight}
              handleChange={(newValue, index) =>
                handleChange({ newValue, index })
              }
            />
          ))}
        </div>
      </form>
    </div>
  );
});

export default ReliablityScore;
