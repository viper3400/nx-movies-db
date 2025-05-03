import type { Meta, StoryObj } from '@storybook/react';
import { Shared } from './shared';
import { within } from '@storybook/test';
import { expect } from '@storybook/test';

const meta: Meta<typeof Shared> = {
  component: Shared,
  title: 'Shared',
};
export default meta;
type Story = StoryObj<typeof Shared>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to Shared!/gi)).toBeTruthy();
  },
};
