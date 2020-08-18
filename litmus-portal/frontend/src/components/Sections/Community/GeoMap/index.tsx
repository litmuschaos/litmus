import React, { useState } from 'react';
import BinarySwitch from '../../../Button/BinarySwitch';
import CityMap from './CityMap';
import CountryMap from './CountryMap';

const GeoMap = () => {
  const [showCountry, setShowCountry] = useState<boolean>(true);
  return (
    <div>
      {showCountry ? <CountryMap /> : <CityMap />}
      <br />
      <br />
      <BinarySwitch
        handleChange={() => setShowCountry(!showCountry)}
        checked={showCountry}
        leftLabel="Country View"
        rightLabel="City View"
      />
    </div>
  );
};
export default GeoMap;
