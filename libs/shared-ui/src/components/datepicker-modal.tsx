import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  DatePicker,
  DateValue,
} from "@heroui/react";
import { Button } from "@heroui-v3/react";
import { EyeOutlined } from "../icons/eye-outlined";
import { useTranslation } from "react-i18next";
import { I18nProvider } from "@react-aria/i18n";
import { useState } from "react";
import { today, getLocalTimeZone } from "@internationalized/date";

interface DatePickerModalProps {
  onDateSelected: (date: Date | null) => void;
}

export const DatePickerModal = ({ onDateSelected }: DatePickerModalProps) => {
  const now = today(getLocalTimeZone());
  const [dateValue, setDateValue] = useState<DateValue | null>(now);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { t } = useTranslation();

  return (
    <>
      <Button variant="primary" onPress={onOpen}>
        <EyeOutlined />
        {t("choose_date_modal.dialog_title")}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{t("choose_date_modal.dialog_title")}</ModalHeader>
              <ModalBody>
                <I18nProvider locale="de">
                  <DatePicker
                    aria-label="datepicker"
                    className="max-w-[284px]"
                    firstDayOfWeek="mon"
                    value={dateValue}
                    onChange={setDateValue} />
                </I18nProvider>
              </ModalBody>
              <ModalFooter>
                <Button variant="danger-soft" onPress={onClose}>
                  {t("choose_date_modal.discard")}
                </Button>
                <Button variant="primary" onPress={() => {
                  if (dateValue) {
                    const date = new Date(Date.UTC(dateValue.year, dateValue.month - 1, dateValue.day, 0, 0, 0));
                    onDateSelected(date); setDateValue(now);
                  }
                  onClose();
                }}>
                  {t("choose_date_modal.select")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal >
    </>
  );
};
