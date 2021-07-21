import React from 'react';
import { useTranslation } from 'react-i18next';
import useStyles from './style';

interface FooterIconButtonProps {
  imgPath: string;
  altText: string;
  url: string;
}

const FooterIconButton: React.FC<FooterIconButtonProps> = ({
  imgPath,
  altText,
  url,
}) => {
  const classes = useStyles();

  return (
    <button
      type="button"
      className={classes.footerIconButton}
      onClick={() => window.open(url)}
    >
      <img src={imgPath} alt={altText} />
    </button>
  );
};

const footerIconButtonData: Array<FooterIconButtonProps> = [
  {
    imgPath: './icons/github.svg',
    altText: 'github',
    url: 'https://github.com/litmuschaos/litmus',
  },
  {
    imgPath: './icons/meetup.svg',
    altText: 'meetup',
    url: 'https://www.meetup.com/Kubernetes-Chaos-Engineering-Meetup-Group',
  },
  {
    imgPath: './icons/devto.svg',
    altText: 'devto',
    url: 'https://dev.to/t/litmuschaos/latest',
  },
  {
    imgPath: './icons/twitter.svg',
    altText: 'twitter',
    url: 'https://twitter.com/LitmusChaos',
  },
  {
    imgPath: './icons/medium.svg',
    altText: 'medium',
    url: 'https://medium.com/litmus-chaos',
  },
  {
    imgPath: './icons/youtube.svg',
    altText: 'youtube',
    url: 'https://www.youtube.com/channel/UCa57PMqmz_j0wnteRa9nCaw',
  },
];

const CommunityFooter: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <footer>
      <div className={classes.root}>
        <div className={classes.footerText}>
          <span> {t('community.footerText')}</span>
        </div>
        <div className={classes.footerIconWrapper}>
          {footerIconButtonData.map((element) => (
            <FooterIconButton
              key={element.altText}
              imgPath={element.imgPath}
              altText={element.altText}
              url={element.url}
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default CommunityFooter;
