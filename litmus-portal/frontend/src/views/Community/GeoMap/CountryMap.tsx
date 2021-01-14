import { useTheme } from '@material-ui/core/styles';
import React from 'react';
import Chart from 'react-google-charts';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/reducers';
import useStyles from './styles';
/* Country geo Map is used for location of users with Country and 
respective count of users wise to present it on map */

const CountryMap = () => {
  const { communityData } = useSelector(
    (state: RootState) => state.communityData
  );
  const classes = useStyles();
  const theme = useTheme();

  const data = communityData.google.geoCountry;

  const parsedData = data.map((item) => [item[0], parseInt(item[1], 10)]);
  parsedData.unshift(['Country', 'Count']);

  return (
    <div className={classes.countryMapchartStyle}>
      <Chart
        className={classes.countryMapchartContentStyle}
        chartType="GeoChart"
        data={parsedData}
        options={{
          colorAxis: {
            colors: ['#1297FF', '#6666FF', '#3D4DDC', '#2B39A5', '#23006A'],
          },
          backgroundColor: theme.palette.cards.background, // White Theme
          datalessRegionColor: '#BFEAFF',
          defaultColor: '#CFCFCF',
        }}
        rootProps={{ 'data-testid': '1' }}
      />
    </div>
  );
};
export default CountryMap;
