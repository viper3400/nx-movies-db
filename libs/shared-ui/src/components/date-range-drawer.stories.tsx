import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateRangeDrawerComponent } from "./date-range-drawer";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

const meta: Meta<typeof DateRangeDrawerComponent> = {
  component: DateRangeDrawerComponent,
  title: "Date Range Drawer Component",
};
export default meta;

type Story = StoryObj<typeof DateRangeDrawerComponent>;

export const Default: Story = {
  args: {
    onApply: fn()
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
      throw new Error("Drawer dialog not found");
    }

    const dialogButtons = within(dialog).getAllByRole("button");
    const applyButton = dialogButtons[dialogButtons.length - 1];

    await userEvent.click(applyButton);

    await waitFor(() => expect(args.onApply).toHaveBeenCalledTimes(1));
  },
};
