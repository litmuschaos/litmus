import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { CustomTagsPopover } from '../CustomTagsPopover';

describe('Custom Tags Popover', () => {
  const tags = ['tag1', 'tag2', 'tag3'];
  test('test if title renders', async () => {
    const user = userEvent.setup();
    const { findByText, getByTestId } = render(<CustomTagsPopover title="tags-title" tags={tags} />);
    await user.hover(getByTestId('tags-icon'));
    expect(await findByText('tags-title')).toBeInTheDocument();
  });
  test('test if tags render', async () => {
    const user = userEvent.setup();
    const { findByText, getByTestId } = render(<CustomTagsPopover title="tags-title" tags={tags} />);
    await user.hover(getByTestId('tags-icon'));
    expect(await findByText('tag1')).toBeInTheDocument();
    expect(await findByText('tag2')).toBeInTheDocument();
    expect(await findByText('tag3')).toBeInTheDocument();
  });
});
