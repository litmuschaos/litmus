import {
  Backdrop,
  Card,
  CardContent,
  Link,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Scaffold from '../../../containers/layouts/Scaffold';
import useStyles from './styles';
import { GET_CHARTS_DATA } from '../../../graphql';
import { RootState } from '../../../redux/reducers';
import { Chart, Charts } from '../../../models/redux/myhub';
import Loader from '../../../components/Loader';
import Center from '../../../containers/layouts/Center';
import HeaderSection from './headerSection';

interface ChartName {
  ChaosName: string;
  ExperimentName: string;
}

const MyHub = () => {
  const classes = useStyles();

  const hubData = useSelector((state: RootState) => state.hubDetails);

  const { HubName, RepoName, RepoURL, RepoBranch, UserName } = hubData;

  const experimentDefaultImagePath = `https://raw.githubusercontent.com/${
    RepoURL.split('/')[3]
  }/${RepoName}/${RepoBranch}/charts/`;

  const { t } = useTranslation();

  const { data, loading } = useQuery<Charts>(GET_CHARTS_DATA, {
    variables: {
      data: {
        UserName,
        RepoURL,
        RepoBranch,
        RepoName,
        HubName,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const [search, setSearch] = useState('');

  const changeSearch = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearch(event.target.value as string);
  };

  const [totalExp, setTotalExperiment] = useState<ChartName[]>([]);

  const exp: ChartName[] = [];

  useEffect(() => {
    if (data !== undefined) {
      const chartList = data?.getCharts;
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
          {t('myhub.myhubChart.header')}
        </Typography>
        <Typography variant="h4">
          <strong>
            {t('myhub.myhubChart.github')}
            {HubName}/{RepoName}
          </strong>
        </Typography>
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
                  <Card
                    key={expName.ExperimentName}
                    elevation={3}
                    className={classes.cardDiv}
                  >
                    <CardContent className={classes.cardContent}>
                      <img
                        src={`${experimentDefaultImagePath}${expName.ChaosName}/icons/${expName.ExperimentName}.png`}
                        alt="add-hub"
                        className={classes.cardImage}
                      />
                      <Link
                        href="#"
                        onClick={(e: any) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSearch(expName.ChaosName);
                        }}
                        className={classes.categoryName}
                      >
                        {expName.ChaosName}/
                      </Link>
                      <Typography
                        className={classes.expName}
                        variant="h6"
                        align="center"
                      >
                        {expName.ExperimentName}
                      </Typography>
                    </CardContent>
                  </Card>
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
