import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { RootState } from '../../../../redux/reducers';
import datageo from './geo.json';

const geoUrl = datageo;

interface CityData {
  name: string;
  coordinates: [number, number];
}

/* City geo Map is used for location of users with 
lat and lng wise to present it on map */
const CityMap: React.FC = () => {
  const [mapData, setMapData] = useState<CityData[]>([]);

  const geoCity = useSelector(
    (state: RootState) => state.communityData.google.geoCity
  );

  useEffect(() => {
    const cityData: CityData[] = [];
    geoCity.map((e) =>
      cityData.push({
        name: e.name,
        coordinates: [parseFloat(e.longitude), parseFloat(e.latitude)],
      })
    );
    setMapData(cityData);
  }, []);

  return (
    <div>
      <ComposableMap
        style={{
          width: 640,
          height: 340,
        }}
      >
        <ZoomableGroup zoom={1.3}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#CFCFCF"
                  stroke="#CFCFCF"
                />
              ))
            }
          </Geographies>
          {mapData &&
            mapData.map(({ name, coordinates }) => (
              <Marker key={`${name}_${coordinates}`} coordinates={coordinates}>
                <g
                  stroke="#858CDD"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="translate(-12, -24)"
                >
                  <circle cx="12" cy="10" r="4" />
                </g>
              </Marker>
            ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default CityMap;
