import React from 'react';
import { useSelector } from 'react-redux';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { RootState } from '../../../redux/reducers';
import datageo from './geo.json';
import useStyles from './styles';

const geoUrl = datageo;

/* City geo Map is used for location of users with 
lat and lng wise to present it on map */
const CityMap: React.FC = () => {
  const classes = useStyles();

  const { communityData } = useSelector(
    (state: RootState) => state.communityData
  );
  const { geoCity } = communityData.google;
  return (
    <div>
      <ComposableMap
        projection="geoMercator"
        className={classes.cityMapComposableMap}
      >
        <ZoomableGroup center={[0, -675]} zoom={0.85}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  className={classes.cityMapGeography}
                  key={geo.rsmKey}
                  geography={geo}
                />
              ))
            }
          </Geographies>
          {geoCity &&
            geoCity.map(
              ({ name, latitude, longitude }) =>
                name !== '(not set)' && (
                  <Marker
                    className={classes.cityMapMarkerStyles}
                    key={`${name}_${latitude}_${longitude}`}
                    coordinates={[
                      parseFloat(longitude) - 4,
                      parseFloat(latitude) + 4,
                    ]}
                  >
                    <circle />
                  </Marker>
                )
            )}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default CityMap;
