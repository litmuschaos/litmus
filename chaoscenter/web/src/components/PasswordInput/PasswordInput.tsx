import React from 'react';
import { Icon, IconName } from '@harnessio/icons';
import { FormInput, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import cx from 'classnames';
import style from './PasswordInput.module.scss';

interface PasswordInputProps {
  disabled?: boolean;
  placeholder?: string;
  name: string;
  label: string | React.ReactElement;
  className?: string;
}

const PasswordInput = (props: PasswordInputProps): React.ReactElement => {
  const { disabled, label, name, placeholder, className } = props;
  const [showPassword, setShowPassword] = React.useState(false);
  const stateIcon: IconName = showPassword ? 'eye-off' : 'eye-open';

  function handleToggleClick(): void {
    setShowPassword(!showPassword);
  }

  return (
    <Layout.Vertical className={cx(style.fieldContainer, className)}>
      {label && typeof label === 'string' ? (
        <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }} color={Color.GREY_600}>
          {label}
        </Text>
      ) : (
        label
      )}
      <div className={style.inputContainer}>
        <FormInput.Text
          name={name}
          inputGroup={{
            type: showPassword ? 'text' : 'password',
            rightElement: <Icon name={stateIcon} size={20} onClick={handleToggleClick} className={style.eyeIcon} />
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </Layout.Vertical>
  );
};

export default PasswordInput;
