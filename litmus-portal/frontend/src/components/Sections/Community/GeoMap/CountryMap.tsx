import React from 'react';
import Chart from 'react-google-charts';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/reducers';

/* Country geo Map is used for location of users with Country and 
respective count of users wise to present it on map */

const CountryMap = () => {
  const data: string[][] = useSelector(
    (state: RootState) => state.communityData.google.geoCountry
  );
  const parsedData = data.map((item) => [item[0], parseInt(item[1], 10)]);
  parsedData.unshift(['Country', 'Count']);

  return (
    <div>
      <Chart
        style={{ margin: 'auto' }}
        width="640px"
        height="340px"
        chartType="GeoChart"
        data={parsedData}
        options={{
          colorAxis: { colors: ['#2CCA8F', 'gray', '#5B44BA'] },
          backgroundColor: '#ffffff',
          datalessRegionColor: '#CFCFCF',
          defaultColor: '#CFCFCF',
        }}
        rootProps={{ 'data-testid': '1' }}
      />
    </div>
  );
};
export default CountryMap;
