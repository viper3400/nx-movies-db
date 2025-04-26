import type { Meta, StoryObj } from "@storybook/react";
import { DatePickerModal } from "./datepicker-modal";

const meta: Meta<typeof DatePickerModal> = {
  component: DatePickerModal,
  title: "DatePickerModal",
};
export default meta;

type Story = StoryObj<typeof DatePickerModal>;


export const Default: Story = {
  args: {
  }
};
