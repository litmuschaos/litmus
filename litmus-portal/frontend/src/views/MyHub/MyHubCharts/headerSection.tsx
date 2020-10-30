import { InputAdornment, InputBase } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';
import useStyles from './styles';

interface HeaderSectionProps {
  searchValue: string;
  changeSearch: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  searchValue,
  changeSearch,
}) => {
  const classes = useStyles();
  return (
    <div>
      <div className={classes.headerSection}>
        {/* Search Field */}
        <InputBase
          id="input-with-icon-adornment"
          placeholder="Search"
          className={classes.search}
          value={searchValue}
          onChange={changeSearch}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />
      </div>
    </div>
  );
};
export default HeaderSection;
