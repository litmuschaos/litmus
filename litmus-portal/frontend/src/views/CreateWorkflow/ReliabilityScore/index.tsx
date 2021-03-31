import { Typography } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, Modal } from 'litmus-ui';
import localforage from 'localforage';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import Center from '../../../containers/layouts/Center';
import { experimentMap } from '../../../models/redux/workflow';
import WeightSlider from '../WeightSlider';
import ResultTable from './ResultTable';
import useStyles from './styles';

const ReliablityScore = forwardRef((_, ref) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [weights, setWeights] = useState<experimentMap[]>([
    {
      experimentName: 'pod-delete',
      weight: 10,
    },
    {
      experimentName: 'pod-cpu-hog',
      weight: 10,
    },
  ]);

  const [open, setOpen] = React.useState(false);

  const testNames: string[] = [];
  const testWeights: number[] = [];

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
              {t('createWorkflow.reliabilityScore.infoNext')}{' '}
              <strong>
                {t('createWorkflow.reliabilityScore.infoNextStrong')}
              </strong>
            </Typography>
          </div>
          <hr className={classes.horizontalLine} />
          <div className={classes.divRow}>
            <Typography className={classes.testHeading}>
              <strong>
                {t('createWorkflow.reliabilityScore.testHeading')}
              </strong>
            </Typography>
          </div>
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
          <hr className={classes.horizontalLine} />
          <div className={classes.modalDiv}>
            <div className={classes.divRow}>
              <ButtonOutlined
                disabled
                onClick={() => setOpen(true)}
                data-cy="testRunButton"
              >
                <div className={classes.buttonOutlineDiv}>
                  <img src="/icons/video.png" alt="Play icon" />
                  <Typography className={classes.buttonOutlineText}>
                    {t('createWorkflow.reliabilityScore.button.demo')}
                  </Typography>
                </div>
              </ButtonOutlined>
              {/* <div className={classes.toolTipDiv}>
                <InfoTooltip value="Text Default" />
                </div> */}
              <Modal open={open} onClose={() => setOpen(false)}>
                <div>
                  <ResultTable testValue={testWeights} testNames={testNames} />
                  <hr className={classes.horizontalLineResult} />
                  <Center>
                    <ButtonFilled
                      onClick={() => setOpen(false)}
                      data-cy="gotItButton"
                      className={classes.gotItBtn}
                    >
                      <div>
                        {t('createWorkflow.reliabilityScore.button.gotIt')}
                      </div>
                    </ButtonFilled>
                  </Center>
                </div>
              </Modal>
            </div>
            <div>
              <Typography className={classes.testInfo}>
                {t('createWorkflow.reliabilityScore.testInfo')}
              </Typography>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
});

export default ReliablityScore;
