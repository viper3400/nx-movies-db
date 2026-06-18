import { Button, Modal } from "@heroui/react";
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
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container>
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.Header>
                  <Modal.Heading>{t("delete_date_modal.dialog_title")}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <p>{date}</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="danger-soft" onPress={close}>
                    {t("common.discard")}
                  </Button>
                  <Button variant="primary" onPress={() => {
                    onDeleteConfirmed(date);
                    close();
                  }}>
                    {t("common.delete")}
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default DeleteSeenDateModal;
