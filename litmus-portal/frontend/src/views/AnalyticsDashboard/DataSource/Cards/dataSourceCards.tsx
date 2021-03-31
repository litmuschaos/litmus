import React from 'react';
import { DataSourceData } from '../../../../models/dataSourceData';
import useActions from '../../../../redux/actions';
import * as DataSourceActions from '../../../../redux/actions/dataSource';
import { history } from '../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import DataSourceCard from './index';
import useStyles from './styles';

interface DataSourceCardsProps {
  dataSources: DataSourceData[];
}

const DataSourceCards: React.FC<DataSourceCardsProps> = ({ dataSources }) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
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
                history.push({
                  pathname: '/analytics/datasource/create',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
              description={d.description}
            />
          </div>
        ))}
    </div>
  );
};

export default DataSourceCards;
