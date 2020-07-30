import React from 'react';
import CustomCard from '../CustomCard';
import CustomWorkflowCard from '../CustomCard/CustomWorkflowCard';
import useStyles from './styles';

const cardData = [
  {
    id: '1',
    title: 'Node CPU Hog',
    utlToIcon: 'https://hub.litmuschaos.io/api/icon/generic/generic.png',
    experimentCount: 1,
    provider: 'MayaData',
    description: 'Injects Node CPU Hog chaos',
    totalRuns: 2,
    customExperiment: false,
  },
  {
    id: '2',
    customExperiment: true,
  },
];

const Chart: React.FC = () => {
  const classes = useStyles();

  const cardArray = cardData.map((item) => {
    if (item.customExperiment) {
      return <CustomWorkflowCard />;
    }
    return (
      <CustomCard
        key={item.title}
        id={item.id}
        title={item.title}
        urlToIcon={item.utlToIcon}
        provider={item.provider}
        experimentCount={item.experimentCount}
        description={item.description}
        totalRuns={item.totalRuns}
      />
    );
  });

  return <div className={classes.chart}>{cardArray}</div>;
};

export default Chart;
