import React from 'react';
import { Icon, IconName } from '@harnessio/icons';
import { FormInput, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import style from './PasswordInput.module.scss';

interface PassowrdInputProps {
  disabled?: boolean;
  placeholder?: string;
  name: string;
  label: string;
}

const PassowrdInput = (props: PassowrdInputProps): React.ReactElement => {
  const { disabled, label, name, placeholder } = props;
  const [showPassword, setShowPassword] = React.useState(false);
  const stateIcon: IconName = showPassword ? 'eye-off' : 'eye-open';

  function handleToggleClick(): void {
    setShowPassword(!showPassword);
  }

  return (
    <Layout.Vertical className={style.fieldContainer}>
      {label && (
        <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }} color={Color.GREY_600}>
          {label}
        </Text>
      )}
      <div className={style.inputContainer}>
        <FormInput.Text
          name={name}
          inputGroup={{
            type: showPassword ? 'text' : 'password'
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
        <Icon name={stateIcon} size={20} onClick={handleToggleClick} className={style.eyeIcon} />
      </div>
    </Layout.Vertical>
  );
};

export default PassowrdInput;
