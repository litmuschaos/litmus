import React, { Component } from 'react';
import { useEffect } from 'react';
import Chart from 'react-google-charts';
import { RootState } from '../../redux/reducers';
import { useSelector } from 'react-redux';
       
// Country geo Map is used for location of users with Country and respective count of users wise to present it on map
   
const GeoChart=()=> {
    const { communityData } = useSelector((state) => state);
    const data = communityData.google.geoCountry;
    
    
    const stale = [["Country", "Count"]];
    const datac = stale.concat(data);
   
    const res = data.map(function (x) { 
         return parseInt(x[1],10);
    });
    const res2 = data.map(function (x) { 
        return x[0];
    });
    const datanew = stale.concat(res2,res);
    const newArray = data.map(item => ([
        item[0],
        parseInt(item[1])
    ]));
    console.log(newArray);
    const datan = stale.concat(newArray);
    
    return (
       <div>
            <Chart
                width={'640px'}
                height={'340px'}
                chartType="GeoChart"
                data={datan}
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
  
}
export default GeoChart;