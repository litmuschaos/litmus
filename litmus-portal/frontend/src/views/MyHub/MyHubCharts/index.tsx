import { Backdrop, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import Scaffold from '../../../containers/layouts/Scaffold';
import useStyles from './styles';
import { GET_CHARTS_DATA, GET_HUB_STATUS } from '../../../graphql';
import { RootState } from '../../../redux/reducers';
import { Chart, Charts, HubStatus } from '../../../models/redux/myhub';
import Loader from '../../../components/Loader';
import Center from '../../../containers/layouts/Center';
import HeaderSection from './headerSection';
import ChartCard from './chartCard';

interface ChartName {
  ChaosName: string;
  ExperimentName: string;
}

interface URLParams {
  hubname: string;
}

const MyHub = () => {
  // User Data from Redux
  const userData = useSelector((state: RootState) => state.userData);

  // Get all MyHubs with status
  const { data: hubDetails } = useQuery<HubStatus>(GET_HUB_STATUS, {
    variables: { data: userData.selectedProjectID },
    fetchPolicy: 'cache-and-network',
  });

  // Get Parameters from URL
  const paramData: URLParams = useParams();

  // Filter the selected MyHub
  const UserHub = hubDetails?.getHubStatus.filter((myHub) => {
    return paramData.hubname === myHub.HubName;
  })[0];

  const classes = useStyles();

  const { t } = useTranslation();

  // Query to get charts of selected MyHub
  const { data, loading } = useQuery<Charts>(GET_CHARTS_DATA, {
    variables: {
      HubName: paramData.hubname,
      projectID: userData.selectedProjectID,
    },
    fetchPolicy: 'cache-and-network',
  });

  // State for searching charts
  const [search, setSearch] = useState('');
  const changeSearch = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearch(event.target.value as string);
  };
  const [totalExp, setTotalExperiment] = useState<ChartName[]>([]);
  const exp: ChartName[] = [];

  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM YYYY hh:mm:ss A');
    if (date) return resDate;
    return 'Date not available';
  };

  useEffect(() => {
    if (data !== undefined) {
      const chartList = data.getCharts;
      chartList.forEach((expData: Chart) => {
        expData.Spec.Experiments.forEach((expName) => {
          exp.push({
            ChaosName: expData.Metadata.Name,
            ExperimentName: expName,
          });
        });
      });
      setTotalExperiment(exp);
    }
  }, [data]);

  return loading ? (
    <Backdrop open className={classes.backdrop}>
      <Loader />
      <Center>
        <Typography variant="h4" align="center">
          {t('myhub.myhubChart.syncingRepo')}
        </Typography>
      </Center>
    </Backdrop>
  ) : (
    <Scaffold>
      <div className={classes.header}>
        <Typography variant="h3" gutterBottom>
          {UserHub?.HubName}
        </Typography>
        <Typography variant="h4">
          <strong>
            {UserHub?.RepoURL}/{UserHub?.RepoBranch}
          </strong>
        </Typography>
        <Typography className={classes.lastSyncText}>
          Last synced at: {formatDate(UserHub ? UserHub.LastSyncedAt : '')}
        </Typography>
        {/* </div> */}
      </div>
      <div className={classes.mainDiv}>
        <HeaderSection searchValue={search} changeSearch={changeSearch} />
        <div className={classes.chartsGroup}>
          {totalExp && totalExp.length > 0 ? (
            totalExp
              .filter(
                (data) =>
                  data.ChaosName.toLowerCase().includes(search.trim()) ||
                  data.ExperimentName.toLowerCase().includes(search.trim())
              )
              .map((expName: ChartName) => {
                return (
                  <ChartCard
                    expName={expName}
                    UserHub={UserHub}
                    setSearch={setSearch}
                    projectID={userData.selectedProjectID}
                  />
                );
              })
          ) : (
            <></>
          )}
        </div>
      </div>
    </Scaffold>
  );
};

export default MyHub;
