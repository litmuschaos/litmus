import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/reducers';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import datageo from './geo.json';

const geoUrl = datageo;
let latitude = 0.0;
let longitude = 0.0;
const coordinates = [latitude, longitude];

const cityData = [
  {
    markerOffset: Number,
    name: String,
    coordinates: coordinates,
  },
];

// City geo Map is used for location of users with lat and lng wise to present it on map
const MapChart = () => {
  const communityData = useSelector((state) => state.communityData);
  useEffect(() => {
    communityData.google.geoCity.map((e) =>
      cityData.push({
        markerOffset: 10,
        name: e.name,
        coordinates: [e.longitude, e.latitude],
      })
    );
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
              geographies
                .map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#CFCFCF"
                    stroke="#CFCFCF"
                  />
                ))
            }
          </Geographies>
          {cityData.map(({ name, coordinates, markerOffset }) => (
            <Marker key={name} coordinates={coordinates}>
              <g
                //fill="none"
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

export default MapChart;