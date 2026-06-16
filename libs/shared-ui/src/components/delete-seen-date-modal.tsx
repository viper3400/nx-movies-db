import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Button } from "@heroui-v3/react";
import { useTranslation } from "react-i18next";

interface DeleteSeenDateModalProps {
  onDeleteConfirmed: (date: string) => void | Promise<void>;
  isOpen: boolean;
  onOpenChange: () => void;
  date: string;
}

export const DeleteSeenDateModal = ({ isOpen, onOpenChange, date, onDeleteConfirmed }: DeleteSeenDateModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{t("delete_date_modal.dialog_title")}</ModalHeader>
            <ModalBody>
              <p>{date}</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="danger-soft" onPress={onClose}>
                {t("common.discard")}
              </Button>
              <Button variant="primary" onPress={() => {
                onDeleteConfirmed(date);
                onClose();
              }}>
                {t("common.delete")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteSeenDateModal;
