import React from 'react';
import { DataSourceData } from '../../../../models/dataSourceData';
import DataSourceCard from './index';
import useStyles from './styles';
import useActions from '../../../../redux/actions';
import * as DataSourceActions from '../../../../redux/actions/dataSource';
import { history } from '../../../../redux/configureStore';

interface DataSourceCardsProps {
  dataSources: DataSourceData[];
}

const DataSourceCards: React.FC<DataSourceCardsProps> = ({ dataSources }) => {
  const classes = useStyles();
  const dataSource = useActions(DataSourceActions);
  return (
    <div className={classes.root}>
      {dataSources &&
        dataSources.map((d: DataSourceData, index: number) => (
          <div key={d.datasourceID} data-cy="dataSourceCard">
            <DataSourceCard
              key={d.datasourceID}
              name={d.name}
              urlToIcon={d.urlToIcon}
              handleClick={() => {
                dataSource.selectDataSource({ selectedDataSourceID: index });
                history.push('/analytics/datasource/create');
              }}
              description={d.description}
            />
          </div>
        ))}
    </div>
  );
};

export default DataSourceCards;
