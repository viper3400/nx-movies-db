import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { DatePickerModal } from "./datepicker-modal";

const meta: Meta<typeof DatePickerModal> = {
  component: DatePickerModal,
  title: "DatePickerModal",
};
export default meta;

type Story = StoryObj<typeof DatePickerModal>;

export const Default: Story = {
  args: {
    onDateSelected: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const documentBody = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole("button");

    await userEvent.click(trigger);

    let dialog: HTMLElement | undefined;
    await waitFor(() => {
      const dialogs = documentBody.getAllByRole("dialog", { hidden: true });
      dialog = dialogs[dialogs.length - 1] as HTMLElement | undefined;
      expect(dialog).toBeTruthy();
    });
    if (!dialog) {
      throw new Error("Modal dialog not found");
    }

    const dialogButtons = within(dialog).getAllByRole("button");
    const selectButton = dialogButtons[dialogButtons.length - 1];

    await userEvent.click(selectButton);

    await waitFor(() => expect(args.onDateSelected).toHaveBeenCalledTimes(1));
  },
};
