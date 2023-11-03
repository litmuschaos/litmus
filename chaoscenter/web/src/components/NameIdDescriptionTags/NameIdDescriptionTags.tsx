import React, { useState } from 'react';
import type { DataTooltipInterface } from '@harnessio/uicore';
import { Container, FormInput, Label } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import type { InputWithIdentifierProps } from '@harnessio/uicore/dist/components/InputWithIdentifier/InputWithIdentifier';
import { isEmpty } from 'lodash-es';
import type { IInputGroupProps, ITagInputProps } from '@blueprintjs/core';
import { Classes } from '@blueprintjs/core';
import cx from 'classnames';
import type { FormikProps } from 'formik';
import { useStrings } from 'strings';
import type {
  DescriptionComponentProps,
  DescriptionProps,
  NameIdDescriptionProps,
  NameIdDescriptionTagsDeprecatedProps,
  TagsComponentProps,
  TagsDeprecatedComponentProps
} from './NameIdDescriptionTagsConstants';
import css from './NameIdDescriptionTags.module.scss';

export interface NameIdDescriptionTagsProps {
  identifierProps?: Omit<InputWithIdentifierProps, 'formik'>;
  inputGroupProps?: IInputGroupProps;
  descriptionProps?: DescriptionProps;
  tagsProps?: Partial<ITagInputProps> & {
    isOption?: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formikProps: FormikProps<any>;
  className?: string;
  tooltipProps?: DataTooltipInterface;
}

export interface NameDescriptionTagsProps {
  inputGroupProps?: IInputGroupProps;
  descriptionProps?: DescriptionProps;
  tagsProps?: Partial<ITagInputProps> & {
    isOption?: boolean;
  };
  disabledFields?: {
    name?: boolean;
    description?: boolean;
    tags?: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formikProps: FormikProps<any>;
  className?: string;
  tooltipProps?: DataTooltipInterface;
  marginBottom?: boolean;
}

interface NameProps {
  nameLabel?: string; // Strong default preference for "Name" vs. Contextual Name (e.g. "Service Name") unless approved otherwise
  namePlaceholder?: string;
  isDisabled?: boolean;
  inputGroupProps?: IInputGroupProps;
  dataTooltipId?: string;
  placeholder?: string;
}

interface NameIdProps {
  nameLabel?: string; // Strong default preference for "Name" vs. Contextual Name (e.g. "Service Name") unless approved otherwise
  namePlaceholder?: string;
  identifierProps?: Omit<InputWithIdentifierProps, 'formik'>;
  inputGroupProps?: IInputGroupProps;
  dataTooltipId?: string;
  placeholder?: string;
}

export const Name = (props: NameProps): JSX.Element => {
  const { getString } = useStrings();
  const { nameLabel = getString('name'), inputGroupProps = {}, isDisabled } = props;

  const newInputGroupProps = {
    placeholder: props.namePlaceholder || getString('nameIdDescriptionTags.namePlaceholder'),
    ...inputGroupProps
  };
  return <FormInput.Text disabled={isDisabled} name="name" label={nameLabel} inputGroup={newInputGroupProps} />;
};

export const NameId = (props: NameIdProps): JSX.Element => {
  const { getString } = useStrings();
  const { identifierProps, nameLabel = getString('name'), inputGroupProps = {} } = props;

  const newInputGroupProps = {
    placeholder: props.namePlaceholder || getString('nameIdDescriptionTags.namePlaceholder'),
    ...inputGroupProps
  };
  return (
    <FormInput.InputWithIdentifier inputLabel={nameLabel} inputGroupProps={newInputGroupProps} {...identifierProps} />
  );
};

export const Description = (props: DescriptionComponentProps): JSX.Element => {
  const { descriptionProps = {}, hasValue, disabled = false } = props;
  const { isOptional = true, ...restDescriptionProps } = descriptionProps;
  const { getString } = useStrings();
  const [isDescriptionOpen, setDescriptionOpen] = useState<boolean>(hasValue || false);
  const [isDescriptionFocus, setDescriptionFocus] = useState<boolean>(false);

  return (
    <Container style={{ marginBottom: isDescriptionOpen ? '0' : 'var(--spacing-medium)' }}>
      <Label className={cx(Classes.LABEL, css.descriptionLabel)} data-tooltip-id={props.dataTooltipId}>
        {isOptional
          ? getString('nameIdDescriptionTags.optionalField', { name: getString('description') })
          : getString('description')}
        {!isDescriptionOpen && (
          <Icon
            className={css.editOpen}
            data-name="edit"
            data-testid="description-edit"
            size={12}
            name="Edit"
            onClick={() => {
              setDescriptionOpen(true);
              setDescriptionFocus(true);
            }}
          />
        )}
      </Label>
      {isDescriptionOpen && (
        <FormInput.TextArea
          data-name="description"
          disabled={disabled}
          autoFocus={isDescriptionFocus}
          name="description"
          tooltipProps={{ dataTooltipId: 'description' }}
          placeholder={getString('nameIdDescriptionTags.descriptionPlaceholder')}
          {...restDescriptionProps}
        />
      )}
    </Container>
  );
};

export const Tags = (props: TagsComponentProps): JSX.Element => {
  const { tagsProps, hasValue, isDisabled, isOptional = true } = props;
  const { getString } = useStrings();
  const [isTagsOpen, setTagsOpen] = useState<boolean>(hasValue || false);

  return (
    <Container>
      <Label className={cx(Classes.LABEL, css.descriptionLabel)} data-tooltip-id={props.dataTooltipId}>
        {isOptional
          ? getString('nameIdDescriptionTags.optionalField', { name: getString('nameIdDescriptionTags.tagsLabel') })
          : getString('nameIdDescriptionTags.tagsLabel')}
        {!isTagsOpen && (
          <Icon
            className={css.editOpen}
            data-name="edit"
            data-testid="tags-edit"
            size={12}
            name="Edit"
            onClick={() => {
              setTagsOpen(true);
            }}
          />
        )}
      </Label>
      {isTagsOpen && <FormInput.KVTagInput name="tags" disabled={isDisabled} isArray={true} tagsProps={tagsProps} />}
    </Container>
  );
};

function TagsDeprecated(props: TagsDeprecatedComponentProps): JSX.Element {
  const { hasValue } = props;
  const { getString } = useStrings();
  const [isTagsOpen, setTagsOpen] = useState<boolean>(hasValue || false);

  return (
    <Container>
      <Label className={cx(Classes.LABEL, css.descriptionLabel)}>
        {getString('nameIdDescriptionTags.tagsLabel')}
        {!isTagsOpen && (
          <Icon
            className={css.editOpen}
            data-name="Edit"
            size={12}
            name="edit"
            onClick={() => {
              setTagsOpen(true);
            }}
          />
        )}
      </Label>
      {isTagsOpen && (
        <FormInput.TagInput
          name="tags"
          labelFor={name => (typeof name === 'string' ? name : '')}
          itemFromNewTag={newTag => newTag}
          items={[]}
          tagInputProps={{
            noInputBorder: true,
            openOnKeyDown: false,
            showAddTagButton: true,
            showClearAllButton: true,
            allowNewTag: true
          }}
        />
      )}
    </Container>
  );
}

export function NameIdDescriptionTags(props: NameIdDescriptionTagsProps): JSX.Element {
  const { getString } = useStrings();
  const {
    className,
    identifierProps,
    descriptionProps,
    tagsProps,
    formikProps,
    inputGroupProps = {},
    tooltipProps
  } = props;
  const newInputGroupProps = { placeholder: getString('nameIdDescriptionTags.namePlaceholder'), ...inputGroupProps };
  return (
    <Container className={cx(css.main, className)}>
      <NameId identifierProps={identifierProps} inputGroupProps={newInputGroupProps} />
      <Description
        descriptionProps={descriptionProps}
        hasValue={!!formikProps?.values.description}
        dataTooltipId={tooltipProps?.dataTooltipId ? `${tooltipProps.dataTooltipId}_description` : undefined}
      />
      <Tags
        tagsProps={tagsProps}
        isOptional={tagsProps?.isOption}
        hasValue={!isEmpty(formikProps?.values.tags)}
        dataTooltipId={tooltipProps?.dataTooltipId ? `${tooltipProps.dataTooltipId}_tags` : undefined}
      />
    </Container>
  );
}

export default function NameDescriptionTags(props: NameDescriptionTagsProps): JSX.Element {
  const { getString } = useStrings();
  const {
    className,
    descriptionProps,
    tagsProps,
    formikProps,
    disabledFields,
    inputGroupProps = {},
    tooltipProps,
    marginBottom
  } = props;
  const newInputGroupProps = { placeholder: getString('nameIdDescriptionTags.namePlaceholder'), ...inputGroupProps };
  return (
    <Container className={cx(css.main, { [css.withMargin]: marginBottom }, className)}>
      <Name isDisabled={disabledFields?.name} inputGroupProps={newInputGroupProps} />
      <Description
        disabled={disabledFields?.description}
        descriptionProps={descriptionProps}
        hasValue={!!formikProps?.values.description}
        dataTooltipId={tooltipProps?.dataTooltipId ? `${tooltipProps.dataTooltipId}_description` : undefined}
      />
      <Tags
        isDisabled={disabledFields?.tags}
        tagsProps={tagsProps}
        isOptional={tagsProps?.isOption}
        hasValue={!isEmpty(formikProps?.values.tags)}
        dataTooltipId={tooltipProps?.dataTooltipId ? `${tooltipProps.dataTooltipId}_tags` : undefined}
      />
    </Container>
  );
}

// Requires verification with existing tags
export function NameIdDescriptionTagsDeprecated<T>(props: NameIdDescriptionTagsDeprecatedProps<T>): JSX.Element {
  const { className, identifierProps, descriptionProps, formikProps } = props;
  return (
    <Container className={cx(css.main, className)}>
      <NameId identifierProps={identifierProps} />
      <Description descriptionProps={descriptionProps} hasValue={!!formikProps?.values.description} />
      <TagsDeprecated hasValue={!isEmpty(formikProps?.values.tags)} />
    </Container>
  );
}

export function NameIdDescription(props: NameIdDescriptionProps): JSX.Element {
  const { getString } = useStrings();
  const { className, identifierProps, descriptionProps, formikProps, inputGroupProps = {} } = props;
  const newInputGroupProps = { placeholder: getString('nameIdDescriptionTags.namePlaceholder'), ...inputGroupProps };

  return (
    <Container className={cx(css.main, className)}>
      <NameId identifierProps={identifierProps} inputGroupProps={newInputGroupProps} />
      <Description descriptionProps={descriptionProps} hasValue={!!formikProps?.values.description} />
    </Container>
  );
}

export function DescriptionTags(props: Omit<NameIdDescriptionTagsProps, 'identifierProps'>): JSX.Element {
  const { className, descriptionProps, tagsProps, formikProps } = props;
  return (
    <Container className={cx(css.main, className)}>
      <Description descriptionProps={descriptionProps} hasValue={!!formikProps?.values.description} />
      <Tags tagsProps={tagsProps} isOptional={tagsProps?.isOption} hasValue={!isEmpty(formikProps?.values.tags)} />
    </Container>
  );
}
