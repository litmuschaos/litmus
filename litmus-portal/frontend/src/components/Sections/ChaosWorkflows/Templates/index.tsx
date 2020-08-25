import React from 'react';
import PredifinedWorkflows from '../../../PredifinedWorkflows';
import workflowData from '../../../PredifinedWorkflows/data';
import { history } from '../../../../redux/configureStore';
import parsed from '../../../../utils/yamlUtils';
import useStyles from './styles';

const Templates = () => {
  const classes = useStyles();

  const testNames: string[] = [];
  const testWeights: number[] = [];

  const selectWorkflow = (index: number) => {
    fetch(workflowData[index].chaosWkfCRDLink)
      .then((data) => {
        data.text().then((yamlText) => {
          const tests = parsed(yamlText);
          tests.forEach((test) => {
            // Pushing the individual test names of the selected workflow
            testNames.push(test);

            // The default weight of the all the experiments in the workflow is 10
            testWeights.push(10);
          });
          history.push({
            pathname: `/workflows/${workflowData[index].title}`,
            state: {
              workflowData: workflowData[index],
              testNames,
              testWeights,
            },
          });
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className={classes.root}>
      {/* Sort div with the sort icon (To be used in later updates) */}
      {/* <div className={classes.sort} onClick={() => {}}>
          <div className={classes.sortIcon}>
            <div className={`${classes.line} ${classes.first}`} />
            <div className={`${classes.line} ${classes.second}`} />
            <div className={`${classes.line} ${classes.third}`} />
          </div>
          <Typography className={classes.headerSize}>Sort</Typography>
        </div> */}
      <div className={classes.predefinedCards}>
        <PredifinedWorkflows
          callbackOnSelectWorkflow={(index: number) => {
            selectWorkflow(index);
          }}
          workflows={workflowData}
        />
      </div>
    </div>
  );
};

export default Templates;
