import { useLazyQuery } from '@apollo/client';
import {
  FormControl,
  Snackbar,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  Input,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ButtonFilled from '../../../components/Button/ButtonFilled';
import { GET_CLUSTER } from '../../../graphql';
import useActions from '../../../redux/actions';
import * as WorkflowActions from '../../../redux/actions/workflow';
import { RootState } from '../../../redux/reducers';
import useStyles from './styles';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 4;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

interface Cluster {
  cluster_id: string;
  is_active: boolean;
}

interface WorkflowClusterProps {
  gotoStep: (page: number) => void;
}

const WorkflowCluster: React.FC<WorkflowClusterProps> = ({ gotoStep }) => {
  const classes = useStyles();
  const workflow = useActions(WorkflowActions);
  const [isTragetSelected, setTarget] = React.useState(true);
  const [isOpenSnackBar, setOpenSnackBar] = React.useState(false);
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  const [name, setName] = React.useState('');
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const str: string = event.target.value as string;
    workflow.setWorkflowDetails({
      clusterid: str,
      project_id: selectedProjectID,
    });
    setName(str);
    setTarget(false);
  };

  const [clusterData, setclusterData] = useState<Cluster[]>([]);

  const [getCluster] = useLazyQuery(GET_CLUSTER, {
    onCompleted: (data) => {
      const clusters: Cluster[] = [];
      if (data && data.getCluster.length !== 0) {
        data.getCluster.forEach((e: Cluster) => {
          if (e.is_active === true) {
            clusters.push({
              cluster_id: e.cluster_id,
              is_active: e.is_active,
            });
          }
        });
        setclusterData(clusters);
      } else {
        setOpenSnackBar(true);
      }
    },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    getCluster({ variables: { project_id: selectedProjectID } });
  }, []);

  const handleClick = () => {
    gotoStep(1);
  };
  const { t } = useTranslation();

  return (
    <div className={classes.rootcontainer}>
      {/* Arrow mark */}
      <div>
        <img src="icons/check.png" className={classes.check} alt="Check" />
      </div>
      <div>
        <Typography className={classes.heading}>
          <strong> {t('workflowCluster.header.connecchooseAgent')}</strong>
        </Typography>
        <Typography className={classes.headchaos}>
          {t('workflowCluster.header.creatingNew')}
          <strong>{t('workflowCluster.header.creatingNewBold')} </strong>
        </Typography>
        <Typography className={classes.headcluster}>
          {t('workflowCluster.header.selectAgent')}
        </Typography>

        <div className={classes.radiobutton}>
          <FormControl
            variant="outlined"
            className={classes.formControl}
            color="secondary"
          >
            <InputLabel className={classes.selectText}>
              {t('workflowCluster.header.selectCluster')}
            </InputLabel>
            <Select
              value={name}
              onChange={handleChange}
              input={<Input />}
              MenuProps={MenuProps}
              className={classes.selectText}
            >
              {clusterData.map((name: Cluster) => (
                <MenuItem key={name.cluster_id} value={name.cluster_id}>
                  {name.cluster_id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* 
        Division is used for Ignite-cluster(where this Litmus portal
        is install and running) or alternative Install Litmus Agent to 
        other Kubernetes cluster 
      */}
      <div className={classes.buttonDiv}>
        <div className={classes.button} data-cy="Internal">
          <ButtonFilled
            data-cy="gotItButton"
            isPrimary
            isDisabled={isTragetSelected}
            handleClick={() => handleClick()}
          >
            <div>{t('workflowCluster.header.select')}</div>
          </ButtonFilled>
        </div>
      </div>
      <Snackbar
        open={isOpenSnackBar}
        action={
          <Typography>
            <strong>{t('workflowCluster.header.snackbar')}</strong>
          </Typography>
        }
        autoHideDuration={6000}
        onClose={() => setOpenSnackBar(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      />
    </div>
  );
};

export default WorkflowCluster;
