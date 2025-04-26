import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useTranslation } from "react-i18next";

interface DeleteSeenDateModalProps {
  onDeleteConfirmed: (date: string) => void;
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
              <Button color="danger" variant="light" onPress={onClose}>
                {t("common.discard")}
              </Button>
              <Button color="primary" onPress={() => {
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
