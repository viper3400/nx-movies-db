import { Button, Calendar, Modal } from "@heroui-v3/react";
import { EyeOutlined } from "../icons/eye-outlined";
import { useTranslation } from "react-i18next";
import { I18nProvider } from "@react-aria/i18n";
import { useState } from "react";
import { today, getLocalTimeZone, type DateValue } from "@internationalized/date";

interface DatePickerModalProps {
  onDateSelected: (date: Date | null) => void;
}

export const DatePickerModal = ({ onDateSelected }: DatePickerModalProps) => {
  const now = today(getLocalTimeZone());
  const [dateValue, setDateValue] = useState<DateValue>(now);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button variant="tertiary" onPress={() => setIsOpen(true)}>
        <EyeOutlined />
        {t("choose_date_modal.dialog_title")}
      </Button>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Modal.Container>
            <Modal.Dialog>
              {({ close }) => (
                <>
                  <Modal.Header>
                    <Modal.Heading>{t("choose_date_modal.dialog_title")}</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <I18nProvider locale="de">
                      <Calendar
                        aria-label="datepicker"
                        firstDayOfWeek="mon"
                        value={dateValue}
                        onChange={setDateValue}
                      >
                        <Calendar.Header>
                          <Calendar.NavButton slot="previous" />
                          <Calendar.YearPickerTrigger>
                            <Calendar.YearPickerTriggerHeading />
                            <Calendar.YearPickerTriggerIndicator />
                          </Calendar.YearPickerTrigger>
                          <Calendar.NavButton slot="next" />
                        </Calendar.Header>
                        <Calendar.Grid>
                          <Calendar.GridHeader>
                            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                          </Calendar.GridHeader>
                          <Calendar.GridBody>
                            {(date) => (
                              <Calendar.Cell date={date}>
                                {({ formattedDate }) => formattedDate}
                              </Calendar.Cell>
                            )}
                          </Calendar.GridBody>
                        </Calendar.Grid>
                      </Calendar>
                    </I18nProvider>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="danger-soft" onPress={close}>
                      {t("choose_date_modal.discard")}
                    </Button>
                    <Button
                      variant="primary"
                      onPress={() => {
                        const date = new Date(Date.UTC(dateValue.year, dateValue.month - 1, dateValue.day, 0, 0, 0));
                        onDateSelected(date);
                        setDateValue(now);
                        close();
                      }}
                    >
                      {t("choose_date_modal.select")}
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
};
