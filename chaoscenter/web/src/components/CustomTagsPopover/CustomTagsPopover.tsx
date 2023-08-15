import React from 'react';
import cx from 'classnames';
import { Text, Popover, Layout, Container, Tag } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { IPopoverProps, PopoverInteractionKind } from '@blueprintjs/core';
import css from './CustomTagsPopover.module.scss';

export interface ListTagsProps {
  tags: string[] | undefined;
  tagClassName?: string;
  popoverProps?: IPopoverProps;
  title?: string;
}

export const CustomTagsPopover: React.FC<ListTagsProps> = props => {
  const { tags, tagClassName, popoverProps } = props;
  return tags && tags.length > 0 ? (
    <Popover interactionKind={PopoverInteractionKind.HOVER} {...popoverProps}>
      <Layout.Horizontal data-testid="tags-icon" flex={{ align: 'center-center' }} spacing="xsmall">
        <Icon name="main-tags" size={15} />
        <Text>{tags.length}</Text>
      </Layout.Horizontal>
      <Container padding="small">
        {props.title && (
          <Text font={{ size: 'small', weight: 'bold' }} margin={{ bottom: 'small' }}>
            {props.title}
          </Text>
        )}
        <Layout.Horizontal className={cx(css.tagsPopover, css.gap2)}>
          {tags.map(tag => (
            <Tag className={tagClassName} key={tag}>
              {tag}
            </Tag>
          ))}
        </Layout.Horizontal>
      </Container>
    </Popover>
  ) : (
    <></>
  );
};
