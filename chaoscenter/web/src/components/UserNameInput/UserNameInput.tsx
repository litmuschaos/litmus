import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { FormInput, Layout, Text } from '@harnessio/uicore';
import style from './UserNameInput.module.scss';

interface UserNameInputProps {
  disabled?: boolean;
  placeholder?: string;
  name: string;
  label: string;
}

const UserNameInput = (props: UserNameInputProps): React.ReactElement => {
  const { disabled, label, name, placeholder } = props;

  return (
    <Layout.Vertical style={{ gap: '0.15rem' }} className={style.mainWrapper}>
      {label && (
        <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }} color={Color.GREY_600}>
          {label}
        </Text>
      )}
      <FormInput.Text name={name} placeholder={placeholder} disabled={disabled} />
    </Layout.Vertical>
  );
};

export default UserNameInput;
