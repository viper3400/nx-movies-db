import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DeleteSeenDateModal } from "./delete-seen-date-modal";
import { Button } from "@heroui/react";

const meta: Meta<typeof DeleteSeenDateModal> = {
  component: DeleteSeenDateModal,
  title: "DeleteSeenDateModal",
};
export default meta;

type Story = StoryObj<typeof DeleteSeenDateModal>;


export const OpenModal: Story = {
  render: () => <OpenModalComponent />,
};

const OpenModalComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteConfirmed = (date: string) => {
    console.log(`Date deleted: ${date}`);
  };

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Open Modal</Button>
      <DeleteSeenDateModal
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(false)}
        date="2025-04-26"
        onDeleteConfirmed={handleDeleteConfirmed} />
    </>
  );
};
