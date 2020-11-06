import { TableCell, Typography, IconButton } from '@material-ui/core';
import React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';
import { Cluster } from '../../../models/graphql/clusterData';
import { history } from '../../../redux/configureStore';
import timeDifferenceForDate from '../../../utils/datesModifier';

interface TableDataProps {
  data: Cluster;
}

const TableData: React.FC<TableDataProps> = ({ data }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM YYYY');
    if (date) return resDate;
    return 'Date not available';
  };
  return (
    <>
      <TableCell className={classes.tableDataStatus}>
        {data.is_cluster_confirmed === false ? (
          <Typography className={`${classes.check} ${classes.pending}`}>
            {t('workflowCluster.header.formControl.menu6')}
          </Typography>
        ) : data.is_cluster_confirmed === true && data.is_active ? (
          <Typography className={`${classes.check} ${classes.active}`}>
            {t('workflowCluster.header.formControl.menu1')}
          </Typography>
        ) : (
          <Typography className={`${classes.check} ${classes.notactive}`}>
            {t('workflowCluster.header.formControl.menu2')}
          </Typography>
        )}
      </TableCell>
      <TableCell
        key={data.cluster_id}
        onClick={() => {
          history.push({ pathname: '/targets/cluster', state: { data } });
        }}
        className={classes.workflowNameData}
      >
        <IconButton size="small">
          <Typography>{data.cluster_name}</Typography>
        </IconButton>
      </TableCell>
      <TableCell className={classes.stepsDataTime}>
        {formatDate(data.updated_at)}
      </TableCell>
      <TableCell>
        <Typography className={classes.stepsData}>
          {data.no_of_schedules}
        </Typography>
      </TableCell>
      <TableCell className={classes.stepsDataschedule}>
        <Typography>{data.no_of_workflows}</Typography>
      </TableCell>
      <TableCell>{timeDifferenceForDate(data.updated_at)}</TableCell>
    </>
  );
};
export default TableData;
