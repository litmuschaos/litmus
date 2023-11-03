import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Maintainer } from '../../models/graphql/chaoshub';
import useStyles from './styles';

interface UsefulLinkProps {
  links: Link[] | undefined;
  maintainers: Maintainer[] | undefined;
  platforms?: string[];
  maturity?: string;
}
const UsefulLinks: React.FC<UsefulLinkProps> = ({
  links,
  maintainers,
  platforms,
  maturity,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const createMaintainers = (maintainers: Maintainer[] | undefined) => {
    return (
      <div className={classes.usefulLinks}>
        <div className={classes.linkDiv}>
          <Typography variant="body1" className={classes.heading}>
            {t('myhub.usefulLink.maintainer')}
          </Typography>
        </div>
        {maintainers?.map((m: Maintainer) => (
          <div className={classes.maintainerField} key={m.name}>
            <Typography className={classes.maintainerlinks}>
              {m.name}
            </Typography>
            <Typography className={classes.maintainerlinks}>
              {m.email}
            </Typography>
          </div>
        ))}
      </div>
    );
  };

  const createLinks = (header: string, data: Link[] | undefined) => {
    return (
      <div className={classes.usefulLinks}>
        <div className={classes.linkDiv}>
          <Typography variant="body1" className={classes.heading}>
            {header}
          </Typography>
        </div>
        {data?.map(
          (d: Link) =>
            d.url && (
              <div key={d.name}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={d.url}
                  className={classes.createLinkText}
                >
                  <Typography className={classes.linkType}>{d.name}</Typography>
                </a>
              </div>
            )
        )}
      </div>
    );
  };
  function createPlatformData(header: string, data: string[]) {
    return (
      <div className={classes.usefulLinks}>
        <div className={classes.linkDiv}>
          <Typography variant="body1" className={classes.heading}>
            {header}
          </Typography>
        </div>
        <div className={classes.linkListBox}>
          {data.map((platform, i) => (
            <span className={classes.staticType} key={platform}>
              {platform}
              {i !== data.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      </div>
    );
  }

  function createStaticData(header: string, data: string[]) {
    return (
      <div className={classes.usefulLinks}>
        <div className={classes.linkDiv}>
          <Typography variant="body1" className={classes.heading}>
            {header}
          </Typography>
        </div>
        <div className={classes.linkListBox}>
          {data.map((d) => (
            <div className={classes.staticType} key={d}>
              {d}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={classes.mainDiv}>
      {createLinks('Useful Links', links)}
      {createMaintainers(maintainers)}
      {platforms && createPlatformData('Platforms', platforms)}
      {maturity && createStaticData('Maturity', [maturity])}
    </div>
  );
};

export default UsefulLinks;
