import type { TagInputProps } from '@harnessio/uicore';
import type { ITagInputProps, IInputGroupProps } from '@blueprintjs/core';
import type { InputWithIdentifierProps } from '@harnessio/uicore/dist/components/InputWithIdentifier/InputWithIdentifier';
import type { FormikProps } from 'formik';

export interface DescriptionProps {
  placeholder?: string;
  isOptional?: boolean;
  disabled?: boolean;
}
export interface DescriptionComponentProps {
  descriptionProps?: DescriptionProps;
  hasValue?: boolean;
  disabled?: boolean;
  dataTooltipId?: string;
}

export interface TagsProps {
  className?: string;
}

export interface TagsComponentProps {
  tagsProps?: Partial<ITagInputProps>;
  hasValue?: boolean;
  isDisabled?: boolean;
  isOptional?: boolean;
  dataTooltipId?: string;
}

export interface TagsDeprecatedComponentProps {
  hasValue?: boolean;
}

export interface NameIdDescriptionTagsDeprecatedProps<T> {
  identifierProps?: Omit<InputWithIdentifierProps, 'formik'>;
  descriptionProps?: DescriptionProps;
  tagInputProps?: TagInputProps<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formikProps: FormikProps<any>;
  className?: string;
}

export interface NameIdDescriptionProps {
  identifierProps?: Omit<InputWithIdentifierProps, 'formik'>;
  inputGroupProps?: IInputGroupProps;
  descriptionProps?: DescriptionProps;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formikProps: Omit<FormikProps<any>, 'tags'>;
}
