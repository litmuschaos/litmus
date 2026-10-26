import React from 'react';
import { Container } from '@harnessio/uicore';

import loginLogo from '@images/login.svg';
import css from './AuthLayout.module.scss';

const AuthLayout: React.FC<React.PropsWithChildren<unknown>> = props => {
  return (
    <div className={css.layout}>
      <div className={css.cardColumn}>
        <div className={css.card}>
          <Container>{props.children}</Container>
        </div>
      </div>
      <div className={css.imageColumn}>
        <img className={css.image} src={loginLogo} alt="" aria-hidden />
      </div>
    </div>
  );
};

export default AuthLayout;
